import express from 'express';
import { authController } from '../controllers';
import {
	changePasswordValidationRules,
	forgotPasswordValidationRules,
	loginValidationRules,
	updateProfileValidationRules,
} from '../helpers/validators';
import { isAuthenticated } from '../middlewares/authMiddleware';
import { updateProfileMiddleware } from '../helpers/multer';

const router = express.Router();

// Login
router.post('/login', loginValidationRules, authController.login);

// Logout
router.post('/logout', authController.logout);

// Register User
router.post('/register', authController.register);

//Test Register
// router.post('/testregister', authController.testregister);
// Forgot password
router.post(
	'/forgot-password',
	forgotPasswordValidationRules,
	authController.forgotPassword
);

// Verify forgot password token
router.post(
	'/verify-forgot-password',
	authController.verifyForgotPasswordToken
);

// Change Password
router.post(
	'/change-password/:token',
	changePasswordValidationRules,
	authController.changePassword
);

// Fetch Profile
router.get('/fetch-profile', isAuthenticated, authController.fetchProfile);

// Update Profile
router.put(
	'/',
	isAuthenticated,
	updateProfileMiddleware.single('profileImg'),
	updateProfileValidationRules,
	authController.updateProfile
);

export default router;
