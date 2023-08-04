import { prisma } from '../client/prisma';
import { UserInfo } from '../interfaces';

class UserRepository {
//Test Register
async register(data:any
) {
	try {
		const user = await prisma.user.create({
			data: data,
		});
		return user;
	} catch (err) {
		throw err;
	}
}

	// Get all users
	async getAll(
		company: string,
		offset?: number,
		limit?: number,
		filterConditions?: any,
		searchCondition?: any,
		sortCondition?: any
	) {
		const sortPosition = sortCondition?.orderBy?.firstName || 'asc';
		try {
			const users = await prisma.companyRole.findMany({
				where: {
					...filterConditions,
					// ...searchCondition,
					user: { ...searchCondition },

					companyId: company,
					NOT: {
						userId: null,
					},
				},
				orderBy: {
					user: {
						firstName: sortPosition || 'asc',
					},
				},
				include: {
					role: true,
					user: true,
				},
				skip: offset,
				take: limit,
			});

			// const res = await prisma.user.findMany({
			// 	where: {
			// 		...filterConditions,
			// 		...searchCondition,
			// 		companies: {
			// 			some: {
			// 				companyId: company,
			// 			},
			// 		},
			// 	},
			// 	skip: offset,
			// 	take: limit,
			// 	include: {
			// 		companies: {
			// 			select: {
			// 				role: {
			// 					select: {
			// 						id: true,
			// 						roleName: true,
			// 						isAdminRole: true,
			// 					},
			// 				},
			// 				company: {
			// 					select: {
			// 						id: true,
			// 						companyName: true,
			// 					},
			// 				},
			// 			},
			// 		},
			// 	},

			// 	...sortCondition,
			// });
			return users;
		} catch (err) {
			console.log(err);
			throw err;
		}
	}

	async checkAddUserLimit(company: string) {
		const totalNoOfUser = await prisma.companyRole.findMany({
			where: {
				companyId: company,
				userId: {
					not: null,
				},
				status: true,
			},
		});
		// const totalNoOfUser = await prisma.user.findMany({
		// 	where: {
		// 		companies: {
		// 			some: {
		// 				companyId: company,
		// 				userId: {
		// 					not: null,
		// 				},
		// 				status: true,
		// 			},
		// 		},
		// 	},
		// });
		const totalAdminUser = await prisma.companyRole.findMany({
			where: {
				companyId: company,
				userId: {
					not: null,
				},
				role: {
					isAdminRole: true,
				},
			},
		});

		return { totalNoOfUser, totalAdminUser };
	}

	async checkNoOfAdmin(company: string) {
		return await prisma.user.findMany({
			where: {
				companies: {
					some: {
						companyId: company,
						userId: {
							not: null,
						},
					},
				},
			},
		});
	}

	// Get data by id
	async getById(id: string) {
		try {
			const user = await prisma.user.findMany({
				where: {
					id: id,
				},
				include: {
					companies: {
						where: {
							NOT: {
								companyId: null,
							},
							status: true,
						},

						include: {
							company: true,
							role: {
								include: {
									permissions: true,
								},
							},
						},
					},
				},
			});
			return user[0];
		} catch (err) {
			throw err;
		}
	}

	// Get data by email
	async getByEmail(email: string) {
		try {
			const user = await prisma.user.findUnique({
				where: {
					email: email,
				},
				include: {
					companies: {
						include: {
							company: true,
							role: true,
						},
					},
				},
			});
			return user;
		} catch (err) {
			throw err;
		}
	}

	// Register a user
	// async register(
	// 	firstName: string,
	// 	lastName: string,
	// 	email: string,
	// 	customerId: string
	// ) {
	// 	try {
	// 		const user = await prisma.user.create({
	// 			data: {
	// 				firstName: firstName,
	// 				lastName: lastName,
	// 				email: email,
	// 				// customerId: customerId,
	// 			},
	// 		});
	// 		return user;
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }

	//  Create a new user
	async create(userData: UserInfo) {
		try {
			const user = await prisma.user.create({
				data: userData,
			});
			return user;
		} catch (err) {
			throw err;
		}
	}

	// Update user
	async update(id: string, data: any) {
		try {
			const user = await prisma.user.update({
				where: { id: id },
				data: data,
				include: {
					companies: {
						where: {
							NOT: {
								companyId: null,
							},
						},

						include: {
							company: true,
							role: true,
						},
					},
				},
			});
			return user;
		} catch (err) {
			throw err;
		}
	}

	// Get total count
	async count(company: string, filterConditions: any, searchCondition: any) {
		try {
			const total = await prisma.companyRole.count({
				where: {
					...filterConditions,
					user: { ...searchCondition },
					companyId: company,
					NOT: {
						userId: null,
					},
				},
			});
			return total;
		} catch (err) {
			throw err;
		}
	}
	// async count(company: string, filterConditions: any, searchCondition: any) {
	// 	try {
	// 		const total = await prisma.user.count({
	// 			where: { ...filterConditions, ...searchCondition },
	// 		});
	// 		return total;
	// 	} catch (err) {
	// 		throw err;
	// 	}
	// }

	// Get all admin emails
	async getAllAdminEmails(companyId: string) {
		try {
			const adminEmails = await prisma.companyRole.findMany({
				where: {
					companyId: companyId,
					OR: [
						{
							role: {
								isAdminRole: true,
							},
						},
						{
							role: {
								isCompanyAdmin: true,
							},
						},
					],
				},
				select: {
					user: {
						select: {
							email: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			});

			return adminEmails;
		} catch (err) {
			throw err;
		}
	}
}

export default new UserRepository();
