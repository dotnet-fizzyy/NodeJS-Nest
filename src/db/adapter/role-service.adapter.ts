import { ICollectionSearchCommand } from '../../bl/commands/collection-search.command';
import { ICreateRoleCommand } from '../../bl/commands/create-role.command';
import { IRoleCommand } from '../../bl/commands/role.command';
import { IRoleDbMapper, RoleDbMapperName } from '../mappers/types/role-mapper.type';
import { IRoleRepository, RoleRepositoryName } from '../base-types/role-repository.type';
import { Inject, Injectable } from '@nestjs/common';
import { ServiceResult } from '../../bl/result-wrappers/service-result';

export interface IRoleServiceAdapter {
    getRoles: (collectionSearchCommand: ICollectionSearchCommand) => Promise<IRoleCommand[]>;
    getRoleById: (id: string) => Promise<ServiceResult<IRoleCommand>>;
    getRoleByName: (name: string) => Promise<ServiceResult<IRoleCommand>>;
    createRole: (createRole: ICreateRoleCommand) => Promise<IRoleCommand>;
    updateRole: (role: IRoleCommand) => Promise<ServiceResult<IRoleCommand>>;
    grantRole: (roleId: string, userId: string) => Promise<ServiceResult>;
    revokeRole: (roleId: string, userId: string) => Promise<ServiceResult>;
    softRemoveRole: (id: string) => Promise<ServiceResult>;
    removeRole: (id: string) => Promise<ServiceResult>;
    removeAllRoles: () => Promise<ServiceResult>;
}

export const RoleServiceAdapterName = Symbol('IRoleServiceAdapter');

@Injectable()
export class RoleServiceAdapter implements IRoleServiceAdapter {
    constructor(
        @Inject(RoleRepositoryName) private readonly _roleRepository: IRoleRepository,
        @Inject(RoleDbMapperName) private readonly _roleMapper: IRoleDbMapper,
    ) {}

    async getRoles({ limit, offset }: ICollectionSearchCommand): Promise<IRoleCommand[]> {
        const roles = await this._roleRepository.getRoles(limit, offset);

        return roles.map((x) => this._roleMapper.mapToCommandFromDb(x));
    }

    async getRoleById(id: string): Promise<ServiceResult<IRoleCommand>> {
        const { serviceResultType, exceptionMessage, data } = await this._roleRepository.getRoleById(id);

        return new ServiceResult<IRoleCommand>(
            serviceResultType,
            data && this._roleMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async getRoleByName(name: string): Promise<ServiceResult<IRoleCommand>> {
        const { serviceResultType, exceptionMessage, data } = await this._roleRepository.getRoleByName(name);

        return new ServiceResult<IRoleCommand>(
            serviceResultType,
            data && this._roleMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async createRole(createRole: ICreateRoleCommand): Promise<IRoleCommand> {
        const createDbRole = this._roleMapper.mapCreateToDbFromCommand(createRole);

        const createdRoleResult = await this._roleRepository.createRole(createDbRole);

        return this._roleMapper.mapToCommandFromDb(createdRoleResult);
    }

    async updateRole(role: IRoleCommand): Promise<ServiceResult<IRoleCommand>> {
        const dbRole = this._roleMapper.mapToDbFromCommand(role);

        const { serviceResultType, exceptionMessage, data } = await this._roleRepository.updateRole(dbRole);

        return new ServiceResult<IRoleCommand>(
            serviceResultType,
            data && this._roleMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async grantRole(roleId: string, userId: string): Promise<ServiceResult> {
        return this._roleRepository.grantRole(roleId, userId);
    }

    async revokeRole(roleId: string, userId: string): Promise<ServiceResult> {
        return this._roleRepository.revokeRole(roleId, userId);
    }

    async softRemoveRole(id: string): Promise<ServiceResult> {
        return this._roleRepository.softRemoveRole(id);
    }

    async removeRole(id: string): Promise<ServiceResult> {
        return this._roleRepository.removeRole(id);
    }

    async removeAllRoles(): Promise<ServiceResult> {
        return this._roleRepository.removeAllRoles();
    }
}
