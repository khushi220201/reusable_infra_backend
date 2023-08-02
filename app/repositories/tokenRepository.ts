// import { prisma } from '../client/prisma';

// class TokenRepository {
// 	async create(userId: string, accessToken: string, refreshToken: string) {
// 		try {
// 			const token = await prisma.token.create({
// 				data: {
// 					userId: userId,
// 					accessToken: accessToken,
// 					refreshToken: refreshToken,
// 				},
// 			});
// 			return token;
// 		} catch (err) {
// 			throw err;
// 		}
// 	}

// 	async delete(userId: string, accessToken: string, refreshToken: string) {
// 		try {
// 			const token = await prisma.token.deleteMany({
// 				where: {
// 					accessToken: accessToken,
// 					refreshToken: refreshToken,
// 					userId: userId,
// 				},
// 			});
// 			return token;
// 		} catch (err) {
// 			throw err;
// 		}
// 	}

// 	async updateTokens(
// 		userId: string,
// 		accessToken: string,
// 		refreshToken: string,
// 		newAccessToken: string,
// 		newRefreshToken: string
// 	) {
// 		try {
// 			const token = await prisma.token.updateMany({
// 				where: {
// 					userId: userId,
// 					accessToken: accessToken,
// 					refreshToken: refreshToken,
// 				},
// 				data: {
// 					accessToken: newAccessToken,
// 					refreshToken: newRefreshToken,
// 				},
// 			});
// 			return token;
// 		} catch (err) {
// 			throw err;
// 		}
// 	}

// 	async findToken(userId: string, accessToken: string, refreshToken: string) {
// 		try {
// 			const token = await prisma.token.findMany({
// 				where: {
// 					userId: userId,
// 					accessToken: accessToken,
// 					refreshToken: refreshToken,
// 				},
// 			});
// 			if (token) {
// 				return true;
// 			} else {
// 				return false;
// 			}
// 		} catch (err) {
// 			throw err;
// 		}
// 	}
// }

// export default new TokenRepository();
