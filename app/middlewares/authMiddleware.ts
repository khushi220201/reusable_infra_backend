import { NextFunction, Response } from 'express';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
} from '../helpers/tokenHelper';
// import { RequestExtended } from '../interfaces/global';
import { CustomError } from '../models/customError';
import tokenRepository from '../repositories/tokenRepository';

export const refreshAccessToken = async (
	accessToken: string,
	refreshToken: string
) => {
	try {
		// Check if the refresh token is valid
		const verified: any = verifyRefreshToken(refreshToken);

		if (!verified) {
			const error = new CustomError(401, 'Invalid refresh token');
			throw error;
		}

		// Generate new access token
		const newAccessToken = generateAccessToken({
			id: verified?.id,
			email: verified?.email,
		});

		// Generate new refresh token
		const newRefreshToken = generateRefreshToken({
			id: verified?.id,
			email: verified?.email,
		});

		await tokenRepository?.updateTokens(
			verified?.id,
			accessToken,
			refreshToken,
			newAccessToken,
			newRefreshToken
		);

		return { newAccessToken, newRefreshToken };
	} catch (err: any) {
		if (err.name == 'TokenExpiredError') {
			const error = new CustomError(401, 'Token expired');
			throw error;
		} else {
			throw err;
		}
	}
};

// export const isAuthenticated = (
// 	req: RequestExtended,
// 	res: Response,
// 	next: NextFunction
// ) => {
// 	try {
// 		// Get the refresh token from the session
// 		const accessToken = req.session.accessToken;

// 		// Get the refresh token from the session
// 		const refreshToken = req.session.refreshToken;

// 		// Check if access token and refresh token are present
// 		if (!accessToken || !refreshToken) {
// 			const error = new CustomError(
// 				401,
// 				'Your session has expired, please login again'
// 			);
// 			return next(error);
// 		}

// 		// Verify the access token
// 		const verifiedAccessToken: any = verifyAccessToken(accessToken);
// 		req.user = {
// 			id: verifiedAccessToken?.id,
// 			email: verifiedAccessToken?.email,
// 		};
// 		if (!verifiedAccessToken) {
// 			const error = new CustomError(401, 'Invalid access token');
// 			return next(error);
// 		}

// 		// // Verify the refresh token
// 		// if (!verifyRefreshToken(refreshToken!)) {
// 		//   const error = new CustomError(401, "Invalid refresh token");
// 		//   return next(error);
// 		// }

// 		// Tokens are valid, proceed to the next middleware or route
// 		next();
// 	} catch (err: any) {
// 		if (err.name == 'TokenExpiredError') {
// 			refreshAccessToken(req.session.refreshToken)
// 				.then((data: any) => {
// 					req.session.accessToken = data?.newAccessToken;
// 					req.session.refreshToken = data?.newRefreshToken;
// 					next();
// 				})
// 				.catch((err) => {
// 					next(err);
// 				});
// 		} else {
// 			next(err);
// 		}
// 	}
// };

export const isAuthenticated = async (
	req: any,
	res: Response,
	next: NextFunction
) => {
	try {
		// Fetch Token from Header
		const accessToken = req?.headers?.authorization?.split(' ')[1] as any;
		const refreshToken = req?.headers?.refreshtoken?.split(' ')[1] as any;

		// const refreshToken = req?.headers?.authorization?.split(' ')[1] as any;

		//   Token Is not Available
		if (!accessToken || !refreshToken) {
			const error = new CustomError(401, 'Unauthorized user');
			return next(error);
		}

		// Verify the access token
		const verifiedAccessToken: any = verifyAccessToken(accessToken);
		req.user = {
			id: verifiedAccessToken?.id,
			email: verifiedAccessToken?.email,
		};
		req.accessToken = accessToken;
		req.refreshToken = refreshToken;

		if (!verifiedAccessToken) {
			const error = new CustomError(401, 'Invalid access token');
			return next(error);
		}

		// const isValid = await checkTokens(
		// 	verifiedAccessToken?.id,
		// 	accessToken,
		// 	refreshToken
		// );

		// console.log('Is valid: ', isValid);

		// if (!isValid) {
		// 	const error = new CustomError(401, 'Token expired');
		// 	return next(error);
		// }

		next();
	} catch (err: any) {
		if (err.name == 'TokenExpiredError') {
			const accessToken = req?.headers?.authorization?.split(' ')[1] as any;
			const refreshToken = req?.headers?.refreshtoken?.split(' ')[1] as any;
			refreshAccessToken(accessToken, refreshToken)
				.then((data: any) => {
					console.log('Data : ', data);
					// req.session.accessToken = data?.newAccessToken;
					// req.session.refreshToken = data?.newRefreshToken;
					next();
				})
				.catch((err) => {
					next(err);
				});
		} else {
			next(err);
		}
	}
};
