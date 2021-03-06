import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export enum ControllerTags {
    Categories = 'Categories',
    Products = 'Products',
    Users = 'Users',
    Roles = 'Roles',
    HealthCheck = 'Health-Check',
    Auth = 'Authentication',
    Ratings = 'Ratings',
}

export default function registerSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Products API')
        .setDescription('This service is responsible for managing games stuff products')
        .setVersion('0.0.1')
        .addTag(ControllerTags.Categories)
        .addTag(ControllerTags.Products)
        .addTag(ControllerTags.Users)
        .addTag(ControllerTags.HealthCheck)
        .addTag(ControllerTags.Roles)
        .addTag(ControllerTags.Ratings)
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/swagger', app, document);
}
