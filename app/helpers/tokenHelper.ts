import jwt from 'jsonwebtoken';
import config from '../../config';
import tokenRepository from '../repositories/tokenRepository';

// Generate AccessToken
export const generateAccessToken = (payload: any) => {
	// expiresIn works in seconds if given in number
	const token = jwt.sign(payload, config.accessTokenSecretKey, {
		expiresIn: config.accessTokenExpireTime,
	});
	return token;
};

// Generate RefreshToken
export const generateRefreshToken = (payload: any) => {
	// expiresIn works in seconds if given in number
	const token = jwt.sign(payload, config.refreshTokenSecretKey, {
		expiresIn: config.refreshTokenExpireTime,
	});
	return token;
};

// Generate Forgot Password Token
export const generateForgotPasswordToken = (payload: any) => {
	const token = jwt.sign(payload, config.forgotPasswordTokenSecretKey);
	return token;
};

// Verify Access Token
export const verifyAccessToken = (accessToken: string) => {
	const verified = jwt.verify(accessToken, config.accessTokenSecretKey);
	return verified;
};

// Verify Refresh Token
export const verifyRefreshToken = (refreshToken: string) => {
	const verified = jwt.verify(refreshToken, config.refreshTokenSecretKey);
	return verified;
};

// Verify Forgot Password Token
export const verifyForgotPasswordToken = (forgotPasswordToken: any) => {
	const verified = jwt.verify(
		forgotPasswordToken,
		config.forgotPasswordTokenSecretKey
	);
	return verified;
};

// Check Tokens in DB
export const checkTokens = async (
	userId: string,
	accessToken: string,
	refreshToken: string
) => {
	const getRecord = await tokenRepository.findToken(
		userId,
		accessToken,
		refreshToken
	);

	return getRecord;
};
