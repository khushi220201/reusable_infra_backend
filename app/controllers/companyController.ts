import { NextFunction, Request, Response } from 'express';
import companyRepository from '../repositories/companyRepository';
import { DefaultResponse } from '../helpers/defaultResponseHelper';
import { RequestExtended } from '../interfaces/global';

class CompanyController {
	async getUserWiseCompanies(
		req: RequestExtended,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = req.user;
			const companies = await companyRepository.getUserCompanies(user);
			return DefaultResponse(
				res,
				200,
				'Companies fetched successfully',
				companies
			);
		} catch (err) {
			next(err);
		}
	}

	async getAllCompanies(req: Request, res: Response, next: NextFunction) {
		try {
			const companies = await companyRepository.getAll();
			return DefaultResponse(
				res,
				200,
				'Companies fetched successfully',
				companies
			);
		} catch (err) {
			next(err);
		}
	}

	async getCompanyDetails(req: Request, res: Response, next: NextFunction) {
		try {
			const { id } = req.params;
			const company = await companyRepository?.getDetails(id);

			return DefaultResponse(
				res,
				200,
				'Company details fetched successfully',
				company
			);
		} catch (err) {
			next(err);
		}
	}

	async createCompany(req: RequestExtended, res: Response) {
		const { companyName, tenantId } = req.body;

		const data = {
			tenantID: tenantId,
			companyName: companyName,
		};

		const company = await companyRepository.create(data);

		const user = req.user?.id;

		await companyRepository?.connectCompany(user, company?.id);

		return DefaultResponse(res, 201, 'Company created successfully', company);
	}
}

export default new CompanyController();
