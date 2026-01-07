import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestConfigService } from 'libs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // ✅ Enable CORS
  app.enableCors({
    origin: ['http://localhost:4201', 'http://localhost:4200'],

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const getFirstErrorMessage = (error: ValidationError): string => {
          if (error.constraints) {
            return Object.values(error.constraints)[0];
          }
          if (error.children && error.children.length > 0) {
            return getFirstErrorMessage(error.children[0]);
          }
          return 'Validation error';
        };
        const firstError = errors[0];
        const firstMessage = getFirstErrorMessage(firstError);
        return new BadRequestException(firstMessage);
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Power Plant')
    .setDescription('Monorepo API backend for NestJS PowerPlant - SepehrSCADA')
    .setVersion('1.0')
    .addTag('authentication')
    .addTag('otp')
    .addTag('password')
    .addTag('2fa')
    .addTag('roles')
    .addTag('settings')
    .addTag('user-managment')
    .addTag('entity types')
    .addTag('entities')
    .addTag('entity fields')
    .addTag('alarm configs')
    .addTag('sources')
    .addTag('charts')
    .addTag('chart details')
    .addTag('chart detail fields')
    .addTag('chart entities')
    .addTag('setup new plant api')
    .addTag('revert setup plant')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  const configService = app.get(NestConfigService);
  const port = configService.port;
  await app.listen(port);
  Logger.log(
    `🚀 admin-dashboard api microservice is running on: https://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
