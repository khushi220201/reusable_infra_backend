export default interface CompanyInfo {
	id?: string;
	companyName?: string;
	tenantID?: string;
	accessToken?: string;
	refreshToken?: string;
	accessTokenUTCDate?: Date;
	customerLastSync?: Date;
	createdAt?: Date;
	updatedAt?: Date;
}
