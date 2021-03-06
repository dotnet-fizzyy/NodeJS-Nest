import { DefaultRoles } from '../../../bl/constants';
import { FilterQuery, Model } from 'mongoose';
import { IAuthUserCommand } from '../../../bl/commands/auth-user.command';
import { ICreateUserDb } from '../../base-types/create-user.type';
import { IUserRepository } from '../../base-types/user-repository.type';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Role, RoleDocument } from '../schemas/role.schema';
import { ServiceResult } from '../../../bl/result-wrappers/service-result';
import { ServiceResultType } from '../../../bl/result-wrappers/service-result-type';
import { User, UserDocument } from '../schemas/user.schema';
import { missingRoleEntityExceptionMessage, missingUserEntityExceptionMessage } from '../../constants';

@Injectable()
export class UserMongooseRepository implements IUserRepository {
    constructor(
        @InjectModel(User.name) private readonly _userModel: Model<UserDocument>,
        @InjectModel(Role.name) private readonly _roleModel: Model<RoleDocument>,
    ) {}

    async getUsers(limit: number, offset: number): Promise<User[]> {
        return this._userModel.find().lean().skip(offset).limit(limit).exec();
    }

    async getUserById(id: string): Promise<ServiceResult<User>> {
        const foundUser = await this.findUserById(id, true);
        if (!foundUser) {
            return new ServiceResult<User>(ServiceResultType.NotFound, null, missingUserEntityExceptionMessage);
        }

        return new ServiceResult<User>(ServiceResultType.Success, foundUser);
    }

    async signInUser(authUserCommand: IAuthUserCommand): Promise<ServiceResult<User>> {
        const foundUser = await this._userModel
            .findOne({
                userName: authUserCommand.userName,
                password: authUserCommand.password,
            })
            .populate('roles', null, Role.name)
            .exec();
        if (!foundUser) {
            return new ServiceResult<User>(ServiceResultType.InvalidData, null, missingUserEntityExceptionMessage);
        }

        return new ServiceResult<User>(ServiceResultType.Success, foundUser);
    }

    async signUpUser(user: ICreateUserDb): Promise<ServiceResult<User>> {
        return this.handleUserCreationDb(user, { displayName: DefaultRoles.Buyer });
    }

    async createUser(user: ICreateUserDb): Promise<ServiceResult<User>> {
        return this.handleUserCreationDb(user, user.roleId && { _id: user.roleId });
    }

    async updateUser(user: User): Promise<ServiceResult<User>> {
        const updateResult = await this._userModel.updateOne(
            { _id: user._id },
            {
                $set: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
            },
        );
        if (!updateResult.nModified) {
            return new ServiceResult<User>(ServiceResultType.NotFound, null, missingUserEntityExceptionMessage);
        }

        const updatedUser = await this.findUserById(user._id, true);

        return new ServiceResult<User>(ServiceResultType.Success, updatedUser);
    }

    async softRemoveUser(id: string): Promise<ServiceResult> {
        const removeResult = await this._userModel.updateOne({ _id: id }, { $set: { isDeleted: true } }).exec();
        if (!removeResult.nModified) {
            return new ServiceResult(ServiceResultType.NotFound, null, missingUserEntityExceptionMessage);
        }

        return new ServiceResult(ServiceResultType.Success);
    }

    async removeUser(id: string): Promise<ServiceResult> {
        const removeResult = await this._userModel.deleteOne({ _id: id }).exec();
        if (!removeResult.deletedCount) {
            return new ServiceResult(ServiceResultType.NotFound, null, missingUserEntityExceptionMessage);
        }

        return new ServiceResult(ServiceResultType.Success);
    }

    async removeAllUsers(): Promise<ServiceResult> {
        const removeResult = await this._userModel.deleteMany().exec();
        if (!removeResult.deletedCount) {
            return new ServiceResult(ServiceResultType.NotFound);
        }

        return new ServiceResult(ServiceResultType.Success);
    }

    private async findUserById(id: string, includeChildren?: boolean): Promise<User> {
        return includeChildren
            ? this._userModel.findOne({ _id: id }).populate({ path: 'roles', model: 'Role' }).exec()
            : this._userModel.findOne({ _id: id }).exec();
    }

    private async handleUserCreationDb(
        user: ICreateUserDb,
        roleSearchFilter: FilterQuery<RoleDocument>,
    ): Promise<ServiceResult<User>> {
        let existingRole: Role;
        if (existingRole) {
            existingRole = await this._roleModel.findOne(roleSearchFilter).exec();

            if (!existingRole) {
                return new ServiceResult<User>(ServiceResultType.NotFound, null, missingRoleEntityExceptionMessage);
            }
        }

        const newUser = new User();
        newUser.userName = user.userName;
        newUser.firstName = user.firstName;
        newUser.lastName = user.lastName;
        newUser.password = user.password;

        if (existingRole) {
            newUser.roles = [existingRole];
        }

        const userSchema = new this._userModel(newUser);
        const createdUser = await userSchema.save();

        await this._roleModel.updateOne({ _id: user.roleId }, { $push: { users: createdUser._id } });

        return new ServiceResult<User>(ServiceResultType.Success, createdUser);
    }
}
