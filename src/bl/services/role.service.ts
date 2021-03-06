import { CreateRoleDto } from '../../api/dto/create-role.dto';
import { IRoleServiceAdapter, RoleServiceAdapterName } from '../../db/adapter/role-service.adapter';
import { Inject, Injectable } from '@nestjs/common';
import { RoleDto } from '../../api/dto/role.dto';
import { RoleManageDto } from '../../api/dto/role-manage.dto';
import { RoleMapper } from '../mappers/role.mapper';
import { Utils } from '../utils';

@Injectable()
export class RoleService {
    constructor(@Inject(RoleServiceAdapterName) private readonly _roleServiceAdapter: IRoleServiceAdapter) {}

    async getRoles(limit?: string, offset?: string): Promise<RoleDto[]> {
        const roles = await this._roleServiceAdapter.getRoles(Utils.getCollectionSearchParameters(limit, offset));

        return roles.map(RoleMapper.mapToDtoFromCommand);
    }

    async getRoleById(id: string): Promise<RoleDto> {
        const { serviceResultType, exceptionMessage, data } = await this._roleServiceAdapter.getRoleById(id);

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);

        return RoleMapper.mapToDtoFromCommand(data);
    }

    async createRole(createRoleDto: CreateRoleDto): Promise<RoleDto> {
        const createdRole = await this._roleServiceAdapter.createRole(
            RoleMapper.mapCreateToCommandFromDto(createRoleDto),
        );

        return RoleMapper.mapToDtoFromCommand(createdRole);
    }

    async updateRole(roleDto: RoleDto): Promise<RoleDto> {
        const { serviceResultType, exceptionMessage, data } = await this._roleServiceAdapter.updateRole(
            RoleMapper.mapToCommandFromDto(roleDto),
        );

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);

        return RoleMapper.mapToDtoFromCommand(data);
    }

    async grantRole({ roleId, userId }: RoleManageDto): Promise<void> {
        const { serviceResultType, exceptionMessage } = await this._roleServiceAdapter.grantRole(roleId, userId);

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);
    }

    async revokeRole({ roleId, userId }: RoleManageDto): Promise<void> {
        const { serviceResultType, exceptionMessage } = await this._roleServiceAdapter.revokeRole(roleId, userId);

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);
    }

    async softRemoveRole(id: string): Promise<void> {
        const { serviceResultType, exceptionMessage } = await this._roleServiceAdapter.softRemoveRole(id);

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);
    }

    async removeRole(id: string): Promise<void> {
        const { serviceResultType, exceptionMessage } = await this._roleServiceAdapter.removeRole(id);

        Utils.validateServiceResultType(serviceResultType, exceptionMessage);
    }
}
