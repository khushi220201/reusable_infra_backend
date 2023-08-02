import { prisma } from '../client/prisma';
import { CompanyInfo } from '../interfaces';

class CompanyRepository {
	async getAll() {
		try {
			const companies = await prisma.company.findMany();
			return companies;
		} catch (err) {
			throw err;
		}
	}

	async getUserCompanies(id: string) {
		try {
			const companies = await prisma.user.findFirst({
				where: {
					id: id,
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
			return companies;
		} catch (err) {
			throw err;
		}
	}

	async getDetails(id: string) {
		try {
			const company = await prisma.company.findUnique({
				where: {
					id: id,
				},
				include: {
					users: {
						select: {
							user: {
								select: {
									id: true,
									firstName: true,
									lastName: true,
									email: true,
								},
							},
							company: {
								select: {
									id: true,
									tenantName: true,
								},
							},
							role: {
								select: {
									id: true,
									roleName: true,
								},
							},
						},
					},
				},
			});
			return company;
		} catch (err) {
			throw err;
		}
	}

	async create(data: CompanyInfo) {
		try {
			const company = await prisma.company.create({
				data: data,
			});
			return company;
		} catch (err) {
			throw err;
		}
	}

	async connectCompany(userId: string, companyId: string) {
		try {
			const companyAdminRole = await prisma.role.findFirst({
				where: {
					roleName: {
						mode: 'insensitive',
						equals: 'Company Admin',
					},
				},
			});

			const company = await prisma.companyRole.create({
				data: {
					user: { connect: { id: userId } },
					role: { connect: { id: companyAdminRole?.id } },
					company: { connect: { id: companyId } },
				},
			});

			// const companyRole = await prisma.companyRole.findFirst({
			// 	where: {
			// 		userId: userId,
			// 		roleId: companyAdminRole?.id,
			// 		companyId: {
			// 			equals: null,
			// 		},
			// 	},
			// });

			// const company = await prisma.companyRole.update({
			// 	where: {
			// 		id: companyRole?.id,
			// 	},
			// 	data: {
			// 		company: { connect: { id: companyId } },
			// 	},
			// });

			return company;
		} catch (err) {
			throw err;
		}
	}
}

export default new CompanyRepository();
