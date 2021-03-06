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
import { CreateProductDto } from '../dto/create-product.dto';
import { DefaultRoles } from '../../bl/constants';
import { ProductDto } from '../dto/product.dto';
import { ProductSearchGuard } from '../guards/product-search.guard';
import { ProductService } from '../../bl/services/product.service';
import { RolesGuard } from '../guards/role.guard';

@ApiTags(ControllerTags.Products)
@Controller('api/products')
export class ProductController {
    constructor(private readonly _productService: ProductService) {}

    @UseGuards(ProductSearchGuard, CollectionSearchGuard)
    @Get()
    @ApiImplicitQuery({ name: 'displayName', required: false, type: String })
    @ApiImplicitQuery({ name: 'minRating', required: false, type: Number })
    @ApiImplicitQuery({ name: 'sortBy', required: false, type: String })
    @ApiImplicitQuery({ name: 'price', required: false, type: String })
    @ApiImplicitQuery({ name: 'limit', required: false, type: Number })
    @ApiImplicitQuery({ name: 'offset', required: false, type: Number })
    @ApiOkResponse({ type: [ProductDto], description: 'OK' })
    async getProducts(
        @Query('displayName') displayName?: string,
        @Query('minRating') minRating?: string,
        @Query('sortBy') sortBy?: string,
        @Query('price') price?: string,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ): Promise<ProductDto[]> {
        return this._productService.getProducts(displayName, minRating, sortBy, price, limit, offset);
    }

    @Get('id/:id')
    @ApiOkResponse({ type: ProductDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async getProductById(@Param('id') id: string): Promise<ProductDto> {
        return this._productService.getProductById(id);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiCreatedResponse({ type: ProductDto, description: 'Created' })
    @ApiBadRequestResponse({ description: 'Bad Request' })
    async createProduct(@Body() productDto: CreateProductDto): Promise<ProductDto> {
        return this._productService.createProduct(productDto);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Put()
    @ApiBearerAuth()
    @ApiOkResponse({ type: ProductDto, description: 'OK' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async updateCategory(@Body() category: ProductDto): Promise<ProductDto> {
        return await this._productService.updateProduct(category);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Delete('soft-remove/id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async softRemoveCategory(@Param('id') id: string): Promise<void> {
        await this._productService.softRemoveProduct(id);
    }

    @UseGuards(new RolesGuard([DefaultRoles.Admin]))
    @Delete('id/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiNoContentResponse({ description: 'No Content' })
    @ApiNotFoundResponse({ description: 'Not Found' })
    async removeCategory(@Param('id') id: string): Promise<void> {
        await this._productService.removeProduct(id);
    }
}
