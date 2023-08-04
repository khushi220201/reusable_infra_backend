/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { checkValidation } from '../helpers/validationHelper';
import { RequestExtended } from '../interfaces/global';
import authServices from '../services/authServices';
import { hashPassword } from '../helpers/passwordHelper';
import { getRegisterEmailTemplateInfra } from '../helpers/emailTemplateHelper';
import {
	companyRoleRepository,
	roleRepository,
	userRepository,
	companyRepository,
} from '../repositories';
import config from '../../config';
import sendEmail from '../helpers/emailHelper';

class AuthController {
//Test Register
async register(req: Request, res: Response, next: NextFunction) {
	console.log("objectff")
	try {
		const {confirmPassword,companyName,...data} = req.body
		const hashedPassword = await hashPassword(data.password);
		data.password=hashedPassword
		const response=await userRepository.register(data)
		const fullName = response.firstName || response.lastName ? response.firstName + ' ' + response.lastName : 'User';
		const emailContent = getRegisterEmailTemplateInfra({fullName});
		const email = response.email;
		console.log('email: ', email);
		const mailOptions = {	
			from: config.smtpEmail,
			to: email,
			subject: 'Welcome to Reusable Infra!',
			html: emailContent,
		};
		console.log('mailOptions: ', mailOptions);
		await sendEmail(mailOptions);
		res.send(response)
	} catch (err) {
		console.log(err);
		next(err);
	}
}

	// // Register User
	// async register(req: Request, res: Response, next: NextFunction) {
	// 	try {
	// 		const { data } = req.body;

	// 		const customer = data?.subscription?.customer;

	// 		const firstName = customer?.first_name;
	// 		const lastName = customer?.last_name;
	// 		const email = customer?.email;
	// 		const customerId = customer?.customer_id;
	// 		let companyAdminRole;

	// 		// Check if company admin role exists
	// 		companyAdminRole = await roleRepository.checkAdmin('Company Admin');

	// 		if (!companyAdminRole) {
	// 			companyAdminRole = await roleRepository.createRole(
	// 				'Company Admin',
	// 				'All company permissions granted',
	// 				false,
	// 				true
	// 			);
	// 		}

	// 		// Check if admin role exists
	// 		const isAdminExist = await roleRepository.checkAdmin('admin');

	// 		if (!isAdminExist) {
	// 			await roleRepository.createRole(
	// 				'Admin',
	// 				'All permissions granted',
	// 				true,
	// 				false
	// 			);
	// 		}

	// 		// Create new user
	// 		const user = await authServices.register(
	// 			firstName,
	// 			lastName,
	// 			email.toLowerCase(),
	// 			customerId
	// 		);

	// 		// TEMP Until we not create the company
	// 		const companyData = {
	// 			tenantID: Math.random().toString(),
	// 			companyName: 'Organization 1',
	// 		};

	// 		const company = await companyRepository.create(companyData);

	// 		await companyRepository?.connectCompany(user.id, company?.id);

	// 		// TEMP END Until we not create the company

	// 		// Uncomment code
	// 		// Create new record in companyRole
	// 		// await companyRoleRepository.create(user?.id, companyAdminRole?.id);

	// 		return DefaultResponse(
	// 			res,
	// 			201,
	// 			'User registration successful, please check your email for accessing your account'
	// 		);
	// 	} catch (err) {
	// 		console.log(err);
	// 		next(err);
	// 	}
	// }

	// Login User
	async login(req: RequestExtended, res: Response, next: NextFunction) {
		console.log("object")
		try {
			checkValidation(req);
			const { email, password } = req.body;

			const { accessToken, refreshToken, user } = await authServices.login(
				email.toLowerCase(),
				password
			);

			console.log(
				'Access token: ' + accessToken + ' refresh token: ' + refreshToken
			);

			// req.session.accessToken = accessToken;
			// req.session.refreshToken = refreshToken;

			const {
				password: userPassword,
				forgotPasswordToken,
				// forgotPasswordTokenExpiresAt,
				isVerified,
				...finalUser
			} = user;

			return DefaultResponse(res, 200, 'User logged in successfully', {
				...finalUser,
				accessToken,
				refreshToken,
			});
		} catch (err) {
			next(err);
		}
	}

	// Forgot Password
	async forgotPassword(req: Request, res: Response, next: NextFunction) {
		try {
			checkValidation(req);

			const { email } = req.body;

			await authServices.forgotPassword(email);

			return DefaultResponse(
				res,
				200,
				'Please check your inbox. If you have account with us you got email with reset instruction.'
				// 'Password reset link sent to your email address'
			);
		} catch (err) {
			console.log('Err: ', err);
			next(err);
		}
	}

	// Verify Forgot Password Token
	async verifyForgotPasswordToken(
		req: Request,
		res: Response,
		next: NextFunction
	) {
		try {
			const { token } = req.query;
			await authServices.verifyForgotPassword(token as string);

			return DefaultResponse(
				res,
				200,
				'Reset Password Token verified successfully'
			);
		} catch (err) {
			next(err);
		}
	}

	// Change Password
	async changePassword(req: Request, res: Response, next: NextFunction) {
		try {
			checkValidation(req);
			const { password } = req.body;
			const { token } = req.params;

			const user = await authServices.changePassword(token, password);

			return DefaultResponse(
				res,
				200,
				'User password changed successfully',
				user
			);
		} catch (err) {
			next(err);
		}
	}

	// Fetch Profile
	async fetchProfile(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const profile = await userRepository.getById(req.user.id);

			// If the user has bought a subscription then there is no company or role assigned to that user
			const user: any = await companyRoleRepository.getRecordWithNullCompanyId(
				req.user.id
			);

			let profileData;
			if (user.length > 0) {
				// Check if the user is companyAdmin
				const isCompanyAdmin = await roleRepository.checkCompanyAdminRole(
					user[0]?.role?.id
				);
				if (isCompanyAdmin) {
					profileData = {
						...profile,
						isFirstCompanyAdmin: true,
					};
				} else {
					profileData = {
						...profile,
						isFirstCompanyAdmin: false,
					};
				}
			} else {
				profileData = {
					...profile,
					isFirstCompanyAdmin: false,
				};
			}

			return DefaultResponse(
				res,
				200,
				'Profile fetched successfully',
				profileData
			);
		} catch (err) {
			next(err);
		}
	}

	// Update Profile
	async updateProfile(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const { email, ...data } = req.body;
			if (req?.file?.location) {
				const fileUrl = req.file.location.replace(config.s3BaseUrl, '');
				data.profileImg = fileUrl;
			}
			// Form data giving the null in string
			if (data.profileImg === 'null') {
				data.profileImg = null;
			}
			const profile = await userRepository.update(req.user.id, data);
			// If the user has bought a subscription then there is no company or role assigned to that user
			const user: any = await companyRoleRepository.getRecordWithNullCompanyId(
				req.user.id
			);

			let profileData;
			if (user.length > 0) {
				// Check if the user is companyAdmin
				const isCompanyAdmin = await roleRepository.checkCompanyAdminRole(
					user[0]?.role?.id
				);
				if (isCompanyAdmin) {
					profileData = {
						...profile,
						isFirstCompanyAdmin: true,
					};
				} else {
					profileData = {
						...profile,
						isFirstCompanyAdmin: false,
					};
				}
			} else {
				profileData = {
					...profile,
					isFirstCompanyAdmin: false,
				};
			}

			return DefaultResponse(
				res,
				200,
				'Profile updated successfully',
				profileData
			);
		} catch (err) {
			console.log(err);
			next(err);
		}
	}

	// Logout

	async logout(req: RequestExtended, res: Response, next: NextFunction) {
		try {
			const accessToken = req.accessToken;
			const refreshToken = req.refreshToken;
			// console.log('LOGOUT: ', accessToken, refreshToken);
			// const deleted = await tokenRepository.delete(
			// 	req.user.id,
			// 	accessToken,
			// 	refreshToken
			// );
			return DefaultResponse(res, 200, 'User logged out successfully');
		} catch (err) {
			next(err);
		}
	}
}

export default new AuthController();
