import { CreateProductCommand } from '../../bl/commands/in/create-product.command';
import { IProductMapper, ProductMapperName } from '../mappers/types/product-mapper.type';
import { IProductRepository, ProductRepositoryName } from '../types/product-repository.type';
import { Inject } from '@nestjs/common';
import { ProductCommand } from '../../bl/commands/out/product.command';
import { ServiceResult } from '../../bl/result-wrappers/service-result';

export interface IProductServiceAdapter {
    getProducts: () => Promise<ProductCommand[]>;
    getProductById: (id: string) => Promise<ServiceResult<ProductCommand>>;
    createProduct: (createProductCommand: CreateProductCommand) => Promise<ServiceResult<ProductCommand>>;
    updateProduct: (productCommand: ProductCommand) => Promise<ServiceResult<ProductCommand>>;
    softRemoveProduct: (id: string) => Promise<ServiceResult>;
    removeProduct: (id: string) => Promise<ServiceResult>;
}

export const ProductServiceAdapterName = 'IProductServiceAdapter';

export class ProductServiceAdapter implements IProductServiceAdapter {
    constructor(
        @Inject(ProductRepositoryName) private readonly _productRepository: IProductRepository,
        @Inject(ProductMapperName) private readonly _productMapper: IProductMapper,
    ) {}

    async getProducts(): Promise<ProductCommand[]> {
        const products = await this._productRepository.getProducts();

        return products.map(this._productMapper.mapToCommandFromDb);
    }

    async getProductById(id: string): Promise<ServiceResult<ProductCommand>> {
        const { serviceResultType, exceptionMessage, data } = await this._productRepository.getProductById(id);

        return new ServiceResult<ProductCommand>(
            serviceResultType,
            data && this._productMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async createProduct(createProductCommand: CreateProductCommand): Promise<ServiceResult<ProductCommand>> {
        const createProductDb = await this._productMapper.mapCreateToDbFromCommand(createProductCommand);

        const { serviceResultType, data, exceptionMessage } = await this._productRepository.createProduct(
            createProductDb,
        );

        return new ServiceResult<ProductCommand>(
            serviceResultType,
            data && this._productMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async updateProduct(productCommand: ProductCommand): Promise<ServiceResult<ProductCommand>> {
        const updateProductDb = await this._productMapper.mapToDbFromCommand(productCommand);

        const { serviceResultType, exceptionMessage, data } = await this._productRepository.updateProduct(
            updateProductDb,
        );

        return new ServiceResult<ProductCommand>(
            serviceResultType,
            data && this._productMapper.mapToCommandFromDb(data),
            exceptionMessage,
        );
    }

    async softRemoveProduct(id: string): Promise<ServiceResult> {
        return this._productRepository.softRemoveProduct(id);
    }

    async removeProduct(id: string): Promise<ServiceResult> {
        return this._productRepository.removeProduct(id);
    }
}