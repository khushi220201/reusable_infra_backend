import config from '../../config';
import sendEmail from '../helpers/emailHelper';
import {
	getForgotPasswordTemplate,
	// getRegisterEmailTemplate,
} from '../helpers/emailTemplateHelper';
import { comparePassword, hashPassword } from '../helpers/passwordHelper';
import {
	generateAccessToken,
	generateForgotPasswordToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyForgotPasswordToken,
} from '../helpers/tokenHelper';
import { CustomError } from '../models/customError';
import userRepository from '../repositories/userRepository';

class AuthServices {
	async login(email: string, password: string) {
		try {
			// Check if user exists

			const user = await userRepository.getByEmail(email);

			if (!user) {
				const error = new CustomError(401, 'Invalid credentials');
				throw error;
			}
   
			// Check if user is verified
			if (!user?.isVerified) {
				const error = new CustomError(401, 'User is not verified');
				throw error;
			}

			//   Validate Password
			const validPassword = await comparePassword(password, user.password!);

			//   Password not valid
			if (!validPassword) {
				const error = new CustomError(401, 'Invalid credentials');
				throw error;
			}

			//   Credentials Valid
			const accessToken = generateAccessToken({ id: user?.id, email: email });
			const refreshToken = generateRefreshToken({ id: user?.id, email: email });

			// const tokenGenerated = await tokenRepository.create(
			// 	user?.id,
			// 	accessToken,
			// 	refreshToken
			// );
			// console.log('Token generated: ', tokenGenerated);

			return { accessToken, refreshToken, user };
		} catch (err) {
			throw err;
		}
	}

	// async register(
	// 	firstName: string,
	// 	lastName: string,
	// 	email: string,
	// 	customerId: string
	// ) {
	// 	try {
	// 		const user = await userRepository.register(
	// 			firstName,
	// 			lastName,
	// 			email,
	// 			customerId
	// 		);

	// 		// Generate forgot password token
	// 		const forgotPasswordToken = generateForgotPasswordToken({
	// 			id: user?.id,
	// 			email: email,
	// 		});

	// 		// Expire time for token
	// 		const forgotPasswordTokenExpiresAt: string = (
	// 			Date.now() + config.registerUrlExpireTime
	// 		).toString();

	// 		// Store token in the database
	// 		await userRepository.update(user?.id, {
	// 			forgotPasswordToken: forgotPasswordToken,
	// 			forgotPasswordTokenExpiresAt: forgotPasswordTokenExpiresAt,
	// 		});

	// 		// Change Password url
	// 		const url = `${config?.changePasswordReactUrl}?token=${forgotPasswordToken}&first=true`;
	// 		// const url = `${config?.reactAppBaseUrl}/change-password?token=${forgotPasswordToken}`;


	// 		const emailContent = getRegisterEmailTemplate({ fullName, url });

			// const mailOptions = {
			// 	from: config.smtpEmail,
			// 	to: email,
			// 	subject: 'Welcome to CostAllocation Pro!',
			// 	html: emailContent,
			// };

	// 		await sendEmail(mailOptions);
	// 		return user;
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }

	async forgotPassword(email: string) {
		try {
			const user = await userRepository.getByEmail(email);

			if (!user) {
				return;
				const error = new CustomError(
					404,
					'Please check your inbox. If you have account with us you got email with reset instruction.'
				);
				throw error;
			}

			// Generate forgot password token
			const forgotPasswordToken = await generateForgotPasswordToken({
				id: user?.id,
				email: email,
			});

			// Expires in 1 hour
			const forgotPasswordTokenExpiresAt: string = (
				Date.now() + config.forgotPasswordUrlExpireTime
			).toString();

			// Store token in the database
			await userRepository.update(user?.id, {
				forgotPasswordToken: forgotPasswordToken,
				// forgotPasswordTokenExpiresAt: forgotPasswordTokenExpiresAt,
			});

			const fullName =
				user?.firstName || user?.lastName
					? user?.firstName + ' ' + user?.lastName
					: 'User';

			// Verify token url
			const url = `${config?.resetPasswordReactUrl}?token=${forgotPasswordToken}&exp=${forgotPasswordTokenExpiresAt}`;
			// const url = `${config?.reactAppBaseUrl}/reset-password?token=${forgotPasswordToken}&exp=${forgotPasswordTokenExpiresAt}`;

			const emailContent = getForgotPasswordTemplate({
				fullName,
				url,
			});

			// Send the email with the reset token
			const mailOptions = {
				from: config.smtpEmail,
				to: email,
				subject: 'Reset Password - CostAllocation Pro',
				html: emailContent,
				// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
			};

			await sendEmail(mailOptions);
			return;
		} catch (err) {
			throw err;
		}
	}

	async verifyForgotPassword(token: string) {
		try {
			// If token not exists, send error message
			if (!token) {
				const err = new CustomError(401, 'Token missing');
				throw err;
			}

			const verified: any = verifyForgotPasswordToken(token);

			// If token not valid, send error message
			if (!verified) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// Find user by email from verified token
			const user = await userRepository.getByEmail(verified?.email as string);

			// If user not exists, send error message
			if (!user) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// If forgotPasswordToken not exists in db, send error message
			if (user.forgotPasswordToken !== token) {
				const err = new CustomError(401, 'Reset token has expired');
				throw err;
			}

			// If token is expired, send error message
			// if (Number(user.forgotPasswordTokenExpiresAt) < Date.now()) {
			// 	const err = new CustomError(401, 'Reset token has expired');
			// 	throw err;
			// }

			// Everything is valid, proceed further
			return true;
		} catch (err) {
			throw err;
		}
	}

	// async changePassword(email: string, password: string) {
	// 	try {
	// 		// Find user by email
	// 		const user = await userRepository.getByEmail(email);

	// 		// User not found
	// 		if (!user) {
	// 			const error = new CustomError(404, 'User not found');
	// 			throw error;
	// 		}

	// 		// Encrypt password
	// 		const hashedPassword = await hashPassword(password);

	// 		// Save password and remove forgot password tokens
	// 		const updatedUser = await userRepository.update(user?.id, {
	// 			password: hashedPassword,
	// 			forgotPasswordToken: null,
	// 			forgotPasswordTokenExpiresAt: null,
	// 		});

	// 		return updatedUser;
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }

	async changePassword(token: string, password: string) {
		try {
			// If token not exists, send error message
			if (!token) {
				const err = new CustomError(401, 'Token missing');
				throw err;
			}

			const verified: any = await verifyForgotPasswordToken(token);

			// If token not valid, send error message
			if (!verified) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// Find user by email from verified token
			const user = await userRepository.getByEmail(verified?.email as string);

			// If user not exists, send error message
			if (!user) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// If forgotPasswordToken not exists in db, send error message
			if (user.forgotPasswordToken !== token) {
				const err = new CustomError(401, 'Reset token has expired');
				throw err;
			}

			// // If token is expired, send error message
			// if (Number(user.forgotPasswordTokenExpiresAt) < Date.now()) {
			// 	const err = new CustomError(401, 'Reset token has expired');
			// 	throw err;
			// }

			// Check if the new password is the same as the old one
			if (user?.password) {
				const encrypted = await comparePassword(password, user?.password);
				if (encrypted) {
					const error = new CustomError(
						422,
						'New password cannot be same as old password'
					);
					throw error;
				}
			}

			// Encrypt password
			const hashedPassword = await hashPassword(password);

			// Save password and remove forgot password tokens
			const updatedUser = await userRepository.update(user?.id, {
				password: hashedPassword,
				isVerified: true,
				forgotPasswordToken: null,
				// forgotPasswordTokenExpiresAt: null,
			});

			return updatedUser;
		} catch (err) {
			throw err;
		}
	}

	async setPassword(token: string, password: string) {
		try {
			// If token not exists, send error message
			if (!token) {
				const err = new CustomError(401, 'Token missing');
				throw err;
			}

			const verified: any = await verifyAccessToken(token);
			console.log("🚀 ~ file: authServices.ts:320 ~ AuthServices ~ setPassword ~ verified:", verified)

			// If token not valid, send error message
			if (!verified) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// Find user by email from verified token
			const user = await userRepository.getByEmail(verified?.email as string);

			// If user not exists, send error message
			if (!user) {
				const err = new CustomError(401, 'Invalid token');
				throw err;
			}

			// If forgotPasswordToken not exists in db, send error message
			// if (user.forgotPasswordToken !== token) {
			// 	const err = new CustomError(401, 'Reset token has expired');
			// 	throw err;
			// }

			// // If token is expired, send error message
			// if (Number(user.forgotPasswordTokenExpiresAt) < Date.now()) {
			// 	const err = new CustomError(401, 'Reset token has expired');
			// 	throw err;
			// }

			// Check if the new password is the same as the old one
			// if (user?.password) {
			// 	const encrypted = await comparePassword(password, user?.password);
			// 	if (encrypted) {
			// 		const error = new CustomError(
			// 			422,
			// 			'New password cannot be same as old password'
			// 		);
			// 		throw error;
			// 	}
			// }

			// Encrypt password
			const hashedPassword = await hashPassword(password);

			// Save password and remove forgot password tokens
			const updatedUser = await userRepository.update(user?.id, {
				password: hashedPassword,
				isVerified: true,
				// forgotPasswordToken: null,
				// forgotPasswordTokenExpiresAt: null,
			});

			return updatedUser;
		} catch (err) {
			throw err;
		}
	}
}

export default new AuthServices();
