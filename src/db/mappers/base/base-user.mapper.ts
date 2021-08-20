import { IBaseUser } from '../../base-types/base-user.type';
import { ICreateUserCommand } from '../../../bl/commands/create-user.command';
import { ICreateUserDb } from '../../base-types/create-user.type';
import { IUserCommand } from '../../../bl/commands/user.command';
import { IUserDbMapper } from '../types/user-mapper.type';

export abstract class BaseUserMapper implements IUserDbMapper {
    mapCreateToDbFromCommand(createCommand: ICreateUserCommand): ICreateUserDb {
        return {
            firstName: createCommand.firstName,
            lastName: createCommand.lastName,
            password: createCommand.password,
        };
    }

    mapToCommandFromDb(userDb: IBaseUser): IUserCommand {
        return {
            firstName: userDb.firstName,
            lastName: userDb.lastName,
            createdAt: userDb.createdAt,
            isDeleted: userDb.isDeleted,
        };
    }

    mapToDbFromCommand(userCommand: IUserCommand): IBaseUser {
        return {
            firstName: userCommand.firstName,
            lastName: userCommand.lastName,
            createdAt: userCommand.createdAt,
            isDeleted: userCommand.isDeleted,
        };
    }
}