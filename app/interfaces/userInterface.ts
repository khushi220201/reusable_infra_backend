export default interface UserInfo {
	id?: string;
	email: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	password?: string;
	isVerified?: boolean;
	forgotPasswordToken?: string;
	forgotPasswordTokenExpiresAt?: string;
	status?: boolean;
	profileImg?: string;
	createdAt?: Date;
	updatedAt?: Date;
	roleId?: string;
	companyId?: string;
}

export interface UpdateUserInfo {
	firstName?: string;
	lastName?: string;
	phone?: string;
	companyId: string;
	roleId?: string;
	userId: string;
	status?: boolean;
	isChangeStatus?: boolean;
}
