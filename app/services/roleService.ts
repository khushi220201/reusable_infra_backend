/* eslint-disable no-mixed-spaces-and-tabs */
import { updateRole } from '../interfaces/roleInterface';
import { CustomError } from '../models/customError';
import { companyRoleRepository, roleRepository } from '../repositories';

class RoleService {
	// Get all the roles
	getAllRoles = async (
		company: string,
		page: number,
		limit: number,
		search?: string,
		filter?: string,
		type?: string,
		sort?: string
	) => {
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ sort:", sort)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ type:", type)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ filter:", filter)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ search:", search)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ limit:", limit)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ company:", company)
		console.log("🚀 ~ file: roleService.ts:17 ~ RoleService ~ page:", page)
		try {
			// Offset set
			let offset;
			console.log("🚀 ~ file: roleService.ts:20 ~ RoleService ~ offset:", offset)
			if (page === 1) {
				offset = (Number(page) - 1) * Number(limit);
				limit = limit - 1;
			} else {
				offset = (Number(page) - 1) * Number(limit) - 1;
			}

			const filterConditions: Record<string, any> = filter
				? { status: filter == 'true' ? true : false }
				: {};

			// Conditions for sort

			// Get all roles
			const roles = await roleRepository.getAllRole(
				sort,
				search!,
				page,
				company,
				offset,
				limit,
				filterConditions
			);
			console.log("🚀 ~ file: roleService.ts:36 ~ RoleService ~ sort:", sort)
			console.log("🚀 ~ file: roleService.ts:38 ~ RoleService ~ search:", search)
			console.log("🚀 ~ file: roleService.ts:40 ~ RoleService ~ page:", page)
			console.log("🚀 ~ file: roleService.ts:42 ~ RoleService ~ company:", company)
			console.log("🚀 ~ file: roleService.ts:44 ~ RoleService ~ offset:", offset)
			console.log("🚀 ~ file: roleService.ts:45 ~ RoleService ~ limit:", limit)
			console.log("🚀 ~ file: roleService.ts:46 ~ RoleService ~ filterConditions:", filterConditions)
			console.log("🚀 ~ file: roleService.ts:43 ~ RoleService ~ roles:", roles)

			const total = await roleRepository.count(search, company);
			console.log("🚀 ~ file: roleService.ts:45 ~ RoleService ~ total:", total)

			return { roles, total: total };
		} catch (err) {
			console.log(err);
			throw err;
		}
	};

	// For create a role
	createRole = async ({

		/////////// isAdmin true for check(test)
		isAdminRole = false,
		roleName,
		roleDescription,
		orgId,
		isCompanyRole = false,
	}: {
		isAdminRole?: boolean;
		roleName: string;
		roleDescription: string;
		orgId: string;
		isCompanyRole?: boolean;
	}) => {
		try {
			const isSameNameRole = await roleRepository.isSameNameRole(
				orgId,
				roleName
			);
			if (isSameNameRole) {
				throw new CustomError(400, 'Role already exist with the same name');
			} else {
				const role = await roleRepository.createRole(
					roleName,
					roleDescription,
					isAdminRole,
					isCompanyRole
				);
				await roleRepository.combineRoleCompany(orgId, role.id);
				return role;
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	// For update the role
	updateUserRole = async (finalData: updateRole) => {
		const { roleId, orgId, ...data }: any = finalData;

		try {
			const role = await roleRepository.getDetails(roleId);
			const isFromSameOrg = await roleRepository.checkCompanyAndRole(
				roleId,
				orgId!
			);
			if (data?.roleName) {
				const isSameNameRole = await roleRepository.isSameNameRole(
					orgId!,
					data?.roleName,
					roleId
				);
				if (isSameNameRole) {
					throw new CustomError(400, 'Role already exist with the same name');
				}
			}
			if (role) {
				if (!(role.isAdminRole || role.isCompanyAdmin)) {
					if (isFromSameOrg) {
						await roleRepository.updateRole({ roleId: roleId, data });
						await companyRoleRepository.updateStatus(
							orgId!,
							// data.companyId!,
							roleId,
							data?.status
						);
					} else {
						throw new CustomError(
							403,
							'Can not update the role of other organization'
						);
					}
				} else {
					throw new CustomError(403, 'You can not update the admin role');
				}
			} else {
				throw new CustomError(404, 'No role found');
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	};

	// For delete the role
	deleteRole = async (roleId: string, companyId: string) => {
		try {
			const role = await roleRepository.getDetails(roleId);
			const isFromSameOrg = await roleRepository.checkCompanyAndRole(
				roleId,
				companyId
			);
			const isUsersInRole = await roleRepository.checkIsUsersInRole(
				roleId,
				companyId
			);
			if (isUsersInRole) {
				throw new CustomError(403, 'Please delete associated user first');
			}
			if (role) {
				if (!(role.isAdminRole || role.isCompanyAdmin)) {
					if (isFromSameOrg) {
						await roleRepository.deleteCompanyRole(roleId);
						await roleRepository.deleteRole(roleId);
					} else {
						throw new CustomError(
							403,
							'Can not delete the role of other organization'
						);
					}
				} else {
					throw new CustomError(403, 'You can not delete the admin role');
				}
			} else {
				throw new CustomError(404, 'No role found');
			}
		} catch (error) {
			console.log(error);
			throw error;
		}
	};
}

export default new RoleService();
