/* eslint-disable no-mixed-spaces-and-tabs */
import config from '../../config';
import sendEmail from '../helpers/emailHelper';
import {
	getInvitationAdminMailTemplate,
	getInvitationEmailUserExistTemplate,
	getInvitationEmailUserTemplate,
} from '../helpers/emailTemplateHelper';
import { generateForgotPasswordToken } from '../helpers/tokenHelper';
import { UpdateUserInfo } from '../interfaces/userInterface';
import { CustomError } from '../models/customError';
import {
	companyRepository,
	roleRepository,
	userRepository,
} from '../repositories';
import companyRoleRepository from '../repositories/companyRoleRepository';
// import inviteRepository from '../repositories/inviteRepository';

class UserServices {
	// Get all users
	async getAllUsers(
		company: string,
		page: number,
		limit: number,
		search?: string,
		filter?: string,
		type?: string,
		sort?: string
	) {
		try {
			// Offset set
			const offset = (Number(page) - 1) * Number(limit);

			// Conditions for filtering
			const filterConditions: Record<string, any> = filter
				? { status: filter == 'true' ? true : false }
				: {};

			// Conditions for search
			const searchCondition = search
				? {
						OR: [
							{
								firstName: {
									mode: 'insensitive',
									contains: search as string,
								},
							},
							{
								lastName: {
									mode: 'insensitive',
									contains: search as string,
								},
							},
							{
								email: { contains: search as string, mode: 'insensitive' },
							},
						],
				  }
				: {};

			// Conditions for sort
			const sortCondition = sort
				? {
						orderBy: {
							[sort as string]: type ?? 'asc',
						},
				  }
				: {};

			// Get all users
			const users = await userRepository.getAll(
				company,
				offset,
				limit,
				filterConditions,
				searchCondition,
				sortCondition
			);

			// Get total user count
			const total = await userRepository.count(
				company,
				filterConditions,
				searchCondition
			);

			return { users, total };
		} catch (err) {
			throw err;
		}
	}

	// Get user by id
	async getUserById(id: string) {
		try {
			const user = await userRepository.getById(id);
			return user;
		} catch (err) {
			throw err;
		}
	}

	// Update user
	async updateUser(data: UpdateUserInfo) {
		try {
			const {
				userId,
				companyId,
				roleId,
				status,
				isChangeStatus = false,
				...userData
			} = data;

			// Find User
			const user = await userRepository.getById(userId);

			if (!user) {
				const error = new CustomError(404, 'User not found');
				throw error;
			}

			// Find Company
			const company = await companyRepository.getDetails(companyId);

			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}

			// Check if user exist in the company
			const userExist = await companyRoleRepository.userExistInCompany(
				companyId,
				userId
			);

			if (!userExist) {
				const error = new CustomError(
					404,
					'User does not exist in this company'
				);
				throw error;
			}
			if (isChangeStatus && roleId) {
				const roleExist = await roleRepository.getDetails(roleId!);
				if (!roleExist) {
					const error = new CustomError(404, 'Role does not exist');
					throw error;
				}

				// Update User Role
				if (status === true) {
					const companyUsers = await userRepository.checkAddUserLimit(
						companyId
					);
					if (companyUsers.totalNoOfUser.length >= 11) {
						throw new CustomError(403, 'User limit is reached');
					}
					if (
						companyUsers.totalAdminUser.length >= 2 &&
						roleExist.isAdminRole
					) {
						throw new CustomError(403, 'Admin user limit is reached');
					}
				}
			}

			let updatedUser;
			await userRepository.update(userId, userData);

			if (status != null && roleId) {
				updatedUser = await companyRoleRepository.updateUserStatus(
					companyId,
					roleId,
					userId,
					status
				);
			}

			if (roleId && companyId) {
				updatedUser = await companyRoleRepository.updateUserRole(
					userId,
					companyId,
					roleId
				);
			}
			updatedUser = await companyRoleRepository.get(userId, companyId, roleId!);

			return updatedUser;
		} catch (err) {
			throw err;
		}
	}

	// Invite user
	async inviteUser(
		invitedBy: string,
		invitedByEmail: string,
		email: string,
		role: string,
		company: string,
		phone: string,
		firstName: string,
		lastName: string
	) {
		try {
			// Find user by Email
			const user = await userRepository.getByEmail(email);

			// Check if role exists
			const roleExist = await roleRepository.getDetails(role);
			if (!roleExist) {
				const error = new CustomError(404, 'Role does not exist');
				throw error;
			}

			if (user) {
				// Check if user already exist in the same company
				const userExist = await roleRepository.userExist(user?.id, company);
				if (userExist.length > 0) {
					const error = new CustomError(
						404,
						'User already exists in the same company'
					);
					throw error;
				}

				const invitedUser = await companyRoleRepository.create(
					user?.id,
					role,
					company
				);

				const companyName = await companyRepository.getDetails(company);

				// Mail send to the invited user

				const emailContent = getInvitationEmailUserExistTemplate({
					email,
					companyName: companyName?.companyName,
					url: config?.reactAppBaseUrl,
				});

				// Send mail to generate new password
				const mailOptions = {
					from: config.smtpEmail,
					to: email,
					subject: 'Invitation to join CostAllocation Pro portal',
					html: emailContent,
					// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
				};

				// Mail send to admin

				const adminEmailContent = getInvitationAdminMailTemplate({
					invitedByEmail,
					email,
					companyName: companyName?.companyName,
					url: config?.reactAppBaseUrl,
				});

				// const adminEmailContent = `
				// <body>
				// 	<p>Hi <b>${invitedByEmail}</b>,</p>
				// 	<br/>
				// 	<p>
				// 		You just invited ${email} to ${company} on CostAllocation Pro. If you don't want this person on your account, you can delete them from your Manage Users page.
				//  	</p>
				// 	<br/>
				// 	<p>
				// 		<a href='${config?.reactAppBaseUrl}' style="color:blue;text-decoration:none;">Click here<a/>, to view the Manage Users page.
				// 	</p>

				// 	<br/>
				// 	<p>
				// 	Best regards,
				// 	<br/>
				// 	<br/>
				// 	CostAllocation Pro Team
				// 	</p>
				// </body>
				// `;

				// Send mail to Admin
				const adminMailOptions = {
					from: config.smtpEmail,
					to: invitedByEmail,
					subject: 'Invitation to join CostAllocation Pro portal',
					html: adminEmailContent,
					// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
				};

				// Send email to user
				await sendEmail(mailOptions);

				// Send email to admin
				await sendEmail(adminMailOptions);

				return invitedUser;
			} else {
				// Checking the no of the user
				const companyUsers = await userRepository.checkAddUserLimit(company);
				if (companyUsers.totalNoOfUser.length >= 11) {
					throw new CustomError(403, 'User limit is reached');
				}
				if (companyUsers.totalAdminUser.length >= 2 && roleExist.isAdminRole) {
					throw new CustomError(403, 'Admin user limit is reached');
				}

				// Reset Password Token Generate
				const resetPasswordToken = await generateForgotPasswordToken({
					email: email,
					role: role,
				});

				// Expires in 1 hour
				const resetPasswordTokenExpiresAt: string = (
					Date.now() + config?.registerUrlExpireTime
				).toString();

				// Create new user with forgot password token and verified false
				const createdUser = await userRepository.create({
					email: email,
					forgotPasswordToken: resetPasswordToken,
					phone: phone,
					firstName,
					lastName,
				});

				// Check if role (first time created) already exists without user

				let companyRole: any;

				const isRoleExists = await companyRoleRepository?.checkCompanyRole(
					company,
					role
				);

				if (isRoleExists) {
					await companyRoleRepository.updateUserCompanyRole(
						createdUser?.id,
						company,
						role
					);
					companyRole = await companyRoleRepository.get(
						createdUser?.id,
						company,
						role
					);
				} else {
					// Create new company role with user, role and company
					companyRole = await companyRoleRepository.create(
						createdUser?.id,
						role,
						company
					);
				}

				// Create new invite
				// await inviteRepository.create(
				// 	invitedBy,
				// 	createdUser?.id,
				// 	role,
				// 	company,
				// 	companyRole?.id
				// );

				const companyName = await companyRepository.getDetails(company);

				// Verify token url
				const url = `${config?.reactAppBaseUrl}/reset-password?token=${resetPasswordToken}&first=true`;

				const emailContent = getInvitationEmailUserTemplate({
					email,
					companyName: companyName?.companyName,
					url,
				});

				// Send mail to generate new password
				const mailOptions = {
					from: config.smtpEmail,
					to: email,
					subject: 'Invitation to join CostAllocation Pro company',
					html: emailContent,
					// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
				};

				// Mail send to admin

				const adminEmailContent = getInvitationAdminMailTemplate({
					invitedByEmail,
					email,
					companyName: companyName?.companyName,
					url: config?.reactAppBaseUrl,
				});

				// Send mail to Admin
				const adminMailOptions = {
					from: config.smtpEmail,
					to: invitedByEmail,
					subject: 'Invitation to join CostAllocation Pro portal',
					html: adminEmailContent,
					// text: `Please use the following token to reset your password: ${forgotPasswordToken}`,
				};

				await sendEmail(mailOptions);
				await sendEmail(adminMailOptions);

				return companyRole;
			}
		} catch (err) {
			throw err;
		}
	}

	// Delete User
	async deleteUser(userId: string, companyId: string) {
		try {
			// Find User
			const user = await userRepository.getById(userId);

			if (!user) {
				const error = new CustomError(404, 'User not found');
				throw error;
			}

			// Find Company
			const company = await companyRepository.getDetails(companyId);

			if (!company) {
				const error = new CustomError(404, 'Company not found');
				throw error;
			}

			// Check if user exist in the company
			const userExist = await companyRoleRepository.userExistInCompany(
				companyId,
				userId
			);

			if (!userExist) {
				const error = new CustomError(
					404,
					'User does not exist in this company'
				);
				throw error;
			}

			// Delete User From Company Role
			const deleteUser = await companyRoleRepository.deleteUserFromCompany(
				userId,
				companyId
			);

			return deleteUser;
		} catch (err) {
			throw err;
		}
	}
}

export default new UserServices();
