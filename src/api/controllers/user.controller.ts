import {
    ApiBadRequestResponse,
    ApiBearerAuth,
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
import { CreateUserDto } from '../dto/create-user.dto';
import { DefaultRoles } from '../../bl/constants';
import { RolesGuard } from '../guards/role.guard';
import { UserDto } from '../dto/user.dto';
import { UserService } from '../../bl/services/user.service';

@ApiTags(ControllerTags.Users)
@Controller('api/users')
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @UseGuards(CollectionSearchGuard, new RolesGuard([DefaultRoles.Admin, DefaultRoles.Buyer]))
    @Get()
    @ApiBearerAuth()
    @ApiImplicitQuery({ name: 'limit', required: false, type: Number })
    @ApiImplicitQuery({ name: 'offset', required: false, type: Number })
    @ApiOkResponse({ type: [UserDto], description: 'OK' })
    async getUsers(@Query('limit') limit?: string, @Query('offset') offset?: string): Promise<UserDto[]> {
        return this._userService.getUsers(limit, offset);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin, DefaultRoles.Buyer]))
    @Get('id/:id')
    @ApiBearerAuth()
    @ApiOkResponse({ type: UserDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async getUserById(@Query('id') id: string): Promise<UserDto> {
        return this._userService.getUserById(id);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiCreatedResponse({ type: UserDto, description: 'Created' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async createUser(@Body() createUser: CreateUserDto): Promise<UserDto> {
        return this._userService.createUser(createUser);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Put()
    @ApiOkResponse({ type: UserDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async updateUser(@Body() user: UserDto): Promise<UserDto> {
        return this._userService.updateUser(user);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Delete('soft-remove/id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async softRemoveUser(@Param('id') id: string): Promise<void> {
        return this._userService.softRemoveUser(id);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Delete('id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async removeUser(@Param('id') id: string): Promise<void> {
        return this._userService.removeUser(id);
    }
}
