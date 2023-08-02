import express from 'express';
import { companyController } from '../controllers';
const router = express.Router();

router.get('/', companyController.getUserWiseCompanies);
router.get('/:id', companyController.getCompanyDetails);
router.post('/', companyController.createCompany);

export default router;
