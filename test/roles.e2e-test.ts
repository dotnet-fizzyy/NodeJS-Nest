import { ApiRequest } from './api-request';
import { AppModule } from '../src/app.module';
import { CustomExceptionFilter } from '../src/api/filters/custom-exception.filter';
import { DefaultRoles } from '../src/bl/constants';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { ICreateUserCommand } from '../src/bl/commands/create-user.command';
import { IRoleCommand } from '../src/bl/commands/role.command';
import { IRoleServiceAdapter, RoleServiceAdapterName } from '../src/db/adapter/role-service.adapter';
import { IUserCommand } from '../src/bl/commands/user.command';
import { IUserServiceAdapter, UserServiceAdapterName } from '../src/db/adapter/user-service.adapter';
import { Response } from 'supertest';
import { RoleDto } from '../src/api/dto/role.dto';
import { ServiceResultType } from '../src/bl/result-wrappers/service-result-type';
import { Test, TestingModule } from '@nestjs/testing';
import { TestUtils } from './utils';
import {
    invalidItemId,
    testRoleName,
    testUserFirstName,
    testUserLastName,
    testUserName,
    testUserPassword,
} from './constants';

describe('RoleController (e2e)', () => {
    const baseRoleUrl = '/api/roles';

    let roleServiceAdapter: IRoleServiceAdapter;
    let userServiceAdapter: IUserServiceAdapter;
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalFilters(new CustomExceptionFilter());

        roleServiceAdapter = moduleFixture.get(RoleServiceAdapterName);
        userServiceAdapter = moduleFixture.get(UserServiceAdapterName);

        await app.init();
    });

    afterEach(async () => {
        await userServiceAdapter.removeAllUsers();
        await roleServiceAdapter.removeAllRoles();
    });

    afterAll(async () => {
        await app.close();
    });

    it(`Should return ${HttpStatus.OK} and collection of items on ${baseRoleUrl} (GET)`, async () => {
        const response: Response = await ApiRequest.get(app.getHttpServer(), baseRoleUrl, true);

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toBeTruthy();
        expect(response.body).toBeInstanceOf(Array);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl} (GET)`, async () => {
        const response: Response = await ApiRequest.get(app.getHttpServer(), baseRoleUrl);

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.OK} and found item on ${TestUtils.getUrlWithId(
        baseRoleUrl,
        ':id',
    )} (GET)`, async () => {
        const createdEntity = await createRole();

        const response: Response = await ApiRequest.get(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, createdEntity.id),
            true,
        );

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response.body).toBeTruthy();
        expect(response.body.id).toEqual(createdEntity.id);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${TestUtils.getUrlWithId(
        baseRoleUrl,
        ':id',
    )} (GET)`, async () => {
        const response: Response = await ApiRequest.get(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, invalidItemId),
        );

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NOT_FOUND} on missing item on ${TestUtils.getUrlWithId(
        baseRoleUrl,
        ':id',
    )} (GET)`, async () => {
        const response: Response = await ApiRequest.get(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, invalidItemId),
            true,
        );

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it(`Should return ${HttpStatus.CREATED} on ${baseRoleUrl} (POST)`, async () => {
        const data = { displayName: testRoleName };
        const response: Response = await ApiRequest.post(app.getHttpServer(), baseRoleUrl, data, true);

        expect(response.status).toEqual(HttpStatus.CREATED);
        expect(response.body).toBeTruthy();
        expect(response.body.displayName).toEqual(data.displayName);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl} (POST)`, async () => {
        const response: Response = await ApiRequest.post(app.getHttpServer(), baseRoleUrl, { displayName: 'testRole' });

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NO_CONTENT} on grant role on ${baseRoleUrl}/grant (POST)`, async () => {
        const basicCreatedRole = await createRole(DefaultRoles.Buyer);
        const createdUser = await createUser(basicCreatedRole.id);

        const newCreatedRole = await createRole();

        const data = { userId: createdUser.id, roleId: newCreatedRole.id };
        const response: Response = await ApiRequest.post(app.getHttpServer(), `${baseRoleUrl}/grant`, data, true);

        expect(response.status).toEqual(HttpStatus.NO_CONTENT);

        const userWithRole = await userServiceAdapter.getUserById(createdUser.id);
        expect(userWithRole.data.roles).toContainEqual({
            id: newCreatedRole.id,
            displayName: newCreatedRole.displayName,
        });
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl}/grant (POST)`, async () => {
        const data = {
            roleId: invalidItemId,
            userId: invalidItemId,
        };

        const response: Response = await ApiRequest.post(app.getHttpServer(), `${baseRoleUrl}/grant`, data);

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NO_CONTENT} on revoke role on ${baseRoleUrl}/revoke (POST)`, async () => {
        const basicCreatedRole = await createRole('Buyer');
        const createdUser = await createUser(basicCreatedRole.id);

        const data = { userId: createdUser.id, roleId: basicCreatedRole.id };
        const response: Response = await ApiRequest.post(app.getHttpServer(), `${baseRoleUrl}/revoke`, data, true);

        expect(response.status).toEqual(HttpStatus.NO_CONTENT);

        const userWithRole = await userServiceAdapter.getUserById(createdUser.id);
        expect(userWithRole.data.roles).toEqual([]);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl}/revoke (POST)`, async () => {
        const data = {
            roleId: invalidItemId,
            userId: invalidItemId,
        };

        const response: Response = await ApiRequest.post(app.getHttpServer(), `${baseRoleUrl}/revoke`, data);

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.OK} on ${baseRoleUrl} (PUT)`, async () => {
        const createdEntity = await createRole();

        const updateData: RoleDto = {
            id: createdEntity.id,
            displayName: 'newRoleName',
            createdAt: createdEntity.createdAt,
            isDeleted: createdEntity.isDeleted,
        };

        const updateResponse: Response = await ApiRequest.put(
            app.getHttpServer(),
            baseRoleUrl,
            updateData as Record<string, any>,
            true,
        );

        expect(updateResponse.status).toEqual(HttpStatus.OK);
        expect(updateResponse.body).toBeTruthy();
        expect(updateResponse.body.displayName).toEqual(updateData.displayName);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl} (PUT)`, async () => {
        const data = {
            id: invalidItemId,
            displayName: 'TestRole',
        };

        const response: Response = await ApiRequest.put(app.getHttpServer(), baseRoleUrl, data);

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NOT_FOUND} for missing item on ${baseRoleUrl} (PUT)`, async () => {
        const data = {
            id: invalidItemId,
            displayName: 'TestRole',
        };

        const response: Response = await ApiRequest.put(app.getHttpServer(), baseRoleUrl, data, true);

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it(`Should return ${HttpStatus.NO_CONTENT} on soft-remove ${baseRoleUrl} (DELETE)`, async () => {
        const createdEntity = await createRole();

        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getSoftRemoveUrlWithId(baseRoleUrl, createdEntity.id),
            true,
        );

        expect(response.status).toEqual(HttpStatus.NO_CONTENT);

        const updatedRole = await roleServiceAdapter.getRoleById(createdEntity.id);
        expect(updatedRole.data.isDeleted).toBeTruthy();
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on soft-remove ${baseRoleUrl} (DELETE)`, async () => {
        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getSoftRemoveUrlWithId(baseRoleUrl, invalidItemId),
        );

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NOT_FOUND} for missing item on soft-remove ${baseRoleUrl} (DELETE)`, async () => {
        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getSoftRemoveUrlWithId(baseRoleUrl, invalidItemId),
            true,
        );

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    it(`Should return ${HttpStatus.NO_CONTENT} on remove ${baseRoleUrl} (DELETE)`, async () => {
        const createdEntity = await createRole();

        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, createdEntity.id),
            true,
        );

        expect(response.status).toEqual(HttpStatus.NO_CONTENT);
    });

    it(`Should return ${HttpStatus.UNAUTHORIZED} for anonymous user on ${baseRoleUrl} (DELETE)`, async () => {
        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, invalidItemId),
        );

        expect(response.status).toEqual(HttpStatus.UNAUTHORIZED);
    });

    it(`Should return ${HttpStatus.NOT_FOUND} for missing item on ${baseRoleUrl} (DELETE)`, async () => {
        const response: Response = await ApiRequest.delete(
            app.getHttpServer(),
            TestUtils.getUrlWithId(baseRoleUrl, invalidItemId),
            true,
        );

        expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });

    const createRole = async (displayName = testRoleName): Promise<IRoleCommand> => {
        const creationData = { displayName };
        const createdEntity = await roleServiceAdapter.createRole(creationData);

        expect(createdEntity).toBeTruthy();
        expect(createdEntity.id).toBeTruthy();

        return createdEntity;
    };

    const createUser = async (roleId: string): Promise<IUserCommand> => {
        const userCreationData: ICreateUserCommand = {
            username: testUserName,
            firstName: testUserFirstName,
            lastName: testUserLastName,
            password: testUserPassword,
            roleId,
        };
        const createdUser = await userServiceAdapter.createUser(userCreationData);

        expect(createdUser.serviceResultType).toEqual(ServiceResultType.Success);
        expect(createdUser.data).toBeTruthy();

        return createdUser.data;
    };
});
