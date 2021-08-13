import { CategoryMapper } from './mappers/category.mapper';
import { CategoryService } from './services/category.service';
import { DbModule } from '../db/db.module';
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ProductMapper } from './mappers/product.mapper';
import { ProductService } from './services/product.service';
import { SettingsModule } from '../settings/settings.module';

@Module({})
export class BlModule {
    static forRoot(): DynamicModule {
        const moduleProviders: Provider[] = [CategoryService, ProductService, CategoryMapper, ProductMapper];

        return {
            module: BlModule,
            imports: [SettingsModule, DbModule.forRoot()],
            providers: moduleProviders,
            exports: moduleProviders,
        };
    }
}
