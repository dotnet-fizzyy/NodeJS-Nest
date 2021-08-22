import { APP_INTERCEPTOR } from '@nestjs/core';
import { BlModule } from '../bl/bl.module';
import { CategoryController } from './controllers/category.controller';
import { HealthCheckController } from './controllers/health-check.controller';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { LoggingModule } from '../logging/logging.module';
import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { RoleController } from './controllers/role.controller';
import { TerminusModule } from '@nestjs/terminus';
import { UserController } from './controllers/user.controller';

@Module({
    imports: [BlModule.forRoot(), LoggingModule, TerminusModule],
    controllers: [ProductController, CategoryController, UserController, RoleController, HealthCheckController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
})
export class ApiModule {}
