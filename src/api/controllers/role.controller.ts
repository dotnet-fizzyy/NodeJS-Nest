import {
    ApiBadRequestResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ApiImplicitQuery } from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from '@nestjs/common';
import { CollectionSearchGuard } from '../guards/collection-search.guard';
import { ControllerTags } from '../../configuration/swagger.configuration';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleDto } from '../dto/role.dto';
import { RoleManageDto } from '../dto/role-manage.dto';
import { RoleService } from '../../bl/services/role.service';

@ApiTags(ControllerTags.Roles)
@Controller('api/roles')
export class RoleController {
    constructor(private readonly _roleService: RoleService) {}

    @UseGuards(CollectionSearchGuard)
    @Get()
    @ApiImplicitQuery({ name: 'limit', required: false, type: Number })
    @ApiImplicitQuery({ name: 'offset', required: false, type: Number })
    @ApiOkResponse({ type: [RoleDto], description: 'OK' })
    async getRoles(@Query('limit') limit?: string, @Query('offset') offset?: string): Promise<RoleDto[]> {
        return this._roleService.getRoles(limit, offset);
    }

    @Get('id/:id')
    @ApiOkResponse({ type: RoleDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async getRoleById(@Query('id') id: string): Promise<RoleDto> {
        return this._roleService.getRoleById(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreatedResponse({ type: RoleDto, description: 'Created' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async createRole(@Body() createRole: CreateRoleDto): Promise<RoleDto> {
        return this._roleService.createRole(createRole);
    }

    @Put()
    @ApiOkResponse({ type: RoleDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async updateRole(@Body() role: RoleDto): Promise<RoleDto> {
        return this._roleService.updateRole(role);
    }

    @Delete('soft-remove/id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async softRemoveRole(@Param('id') id: string): Promise<void> {
        return this._roleService.softRemoveRole(id);
    }

    @Post('grant')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async grantRole(@Body() roleManagement: RoleManageDto): Promise<void> {
        return this._roleService.grantRole(roleManagement);
    }

    @Post('revoke')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async revokeRole(@Body() roleManagement: RoleManageDto): Promise<void> {
        return this._roleService.revokeRole(roleManagement);
    }

    @Delete('id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async removeRole(@Param('id') id: string): Promise<void> {
        return this._roleService.removeRole(id);
    }
}
