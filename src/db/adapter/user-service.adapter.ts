import { ICollectionSearchCommand } from '../../bl/commands/collection-search.command';
import { ICreateUserCommand } from '../../bl/commands/create-user.command';
import { IUserCommand } from '../../bl/commands/user.command';
import { IUserDbMapper, UserDbMapperName } from '../mappers/types/user-mapper.type';
import { IUserRepository, UserRepositoryName } from '../base-types/user-repository.type';
import { Inject, Injectable } from '@nestjs/common';
import { ServiceResult } from '../../bl/result-wrappers/service-result';

@Injectable()
export class UserServiceAdapter {
    constructor(
        @Inject(UserRepositoryName) private readonly _userRepository: IUserRepository,
        @Inject(UserDbMapperName) private readonly _userMapper: IUserDbMapper,
    ) {}

    async getUsers({ limit, offset }: ICollectionSearchCommand): Promise<IUserCommand[]> {
        const users = await this._userRepository.getUsers(limit, offset);

        return users.map((x) => this._userMapper.mapToCommandFromDb(x));
    }

    async getUserById(id: string): Promise<ServiceResult<IUserCommand>> {
        const { serviceResultType, exceptionMessage, data } = await this._userRepository.getUserById(id);

        return new ServiceResult<IUserCommand>(
            serviceResultType,
            data && this._userMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async createUser(createUserCommand: ICreateUserCommand): Promise<ServiceResult<IUserCommand>> {
        const dbUser = this._userMapper.mapCreateToDbFromCommand(createUserCommand);

        const { serviceResultType, exceptionMessage, data } = await this._userRepository.createUser(dbUser);

        return new ServiceResult(
            serviceResultType,
            data && this._userMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async updateUser(userCommand: IUserCommand): Promise<ServiceResult<IUserCommand>> {
        const dbUser = this._userMapper.mapToDbFromCommand(userCommand);

        const { serviceResultType, exceptionMessage, data } = await this._userRepository.updateUser(dbUser);

        return new ServiceResult<IUserCommand>(
            serviceResultType,
            data && this._userMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async softRemoveUser(id: string): Promise<ServiceResult> {
        return UserServiceAdapter.handleUserRemove(id, this._userRepository.softRemoveUser);
    }

    async removeUser(id: string): Promise<ServiceResult> {
        return UserServiceAdapter.handleUserRemove(id, this._userRepository.removeUser);
    }

    private static async handleUserRemove(id: string, callback: (id: string) => Promise<ServiceResult>) {
        return callback(id);
    }
}
