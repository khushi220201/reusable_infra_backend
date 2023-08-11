/* eslint-disable @typescript-eslint/no-var-requires */
const { body } = require('express-validator');

// Login validation rules
export const loginValidationRules = [
	
	// Validate email
	body('email').isEmail().withMessage('Invalid email address'),

	// Validate password
	body('password').notEmpty().withMessage('Password is required'),
];

// Forgot Password validation rules
export const forgotPasswordValidationRules = [
	// Validate email
	body('email').isEmail().withMessage('Invalid email address'),
];




// Change Password validation rules
export const changePasswordValidationRules = [
	// Validate password
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
		)
		.withMessage(
			'Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 8 characters long'
		),

	// Validate confirmPassword
	body('confirmPassword')
		.notEmpty()
		.withMessage('Confirm password required')
		.custom((value: any, { req }: any) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match');
			}
			return true;
		}),
];

// Set Password validation rules
export const setPasswordValidationRules = [
	// Validate password
	body('password')
		.isLength({ min: 8 })
		.withMessage('Password must be at least 8 characters long')
		.matches(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/
		)
		.withMessage(
			'Password must contain at least one digit, one lowercase letter, one uppercase letter, and be at least 8 characters long'
		),

	// Validate confirmPassword
	body('confirmPassword')
		.notEmpty()
		.withMessage('Confirm password required')
		.custom((value: any, { req }: any) => {
			if (value !== req.body.password) {
				throw new Error('Passwords do not match');
			}
			return true;
		}),
];






// Invite User validation rules
export const inviteUserValidationRules = [
	body('email').isEmail().withMessage('Invalid email address'),
	body('role')
		.notEmpty()
		.withMessage('Role id is required')
		.isUUID()
		.withMessage('Invalid role'),
	body('company')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid company'),
];

// Delete User from Company
export const deleteUserFromCompanyRules = [
	body('user')
		.notEmpty()
		.withMessage('User id is required')
		.isUUID()
		.withMessage('Invalid User'),
	body('company')
		.notEmpty()
		.withMessage('Company id is required')
		.isUUID()
		.withMessage('Invalid Company'),
];

// Update profile validation rules

export const updateProfileValidationRules = [
	body('firstName')
		.optional()
		.isLength({ min: 2 })
		.withMessage('First name must be at least 2 characters'),
	body('lastName')
		.optional()
		.isLength({ min: 2 })
		.withMessage('Last name must be at least 2 characters'),
	body('phone')
		.optional()
		.matches(/^\d{10}$/)
		.withMessage('Invalid phone number format'),
];

// for roles

export const companyIdValidationRules = [
	body('orgId').notEmpty().withMessage('Please select the organization'),
];

export const createRoleValidationRules = [
	...companyIdValidationRules,
	body('roleName').notEmpty().withMessage('Please enter the role name'),
	body('roleDescription')
		.notEmpty()
		.withMessage('Please enter the role description'),
];

export const updateRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
	body('roleName').optional(),
	body('roleDescription').optional(),
];

export const deleteRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
];

export const permissionRoleValidationRules = [
	...companyIdValidationRules,
	body('roleId').notEmpty().withMessage('Please enter the role id'),
	body('permissions').notEmpty().withMessage('Please enter the permissions'),
];

// Update User By Admin
export const updateUserByAdminValidation = [
	body('userId').notEmpty().withMessage('User id is required'),
	body('companyId').notEmpty().withMessage('Company id is required'),
];
