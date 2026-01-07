import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestConfigService } from './providers/config.service';
import { validationSchema } from './validation/validation.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env['NODE_ENV'] || 'development'}`, '.env'],
      isGlobal: true,
      cache: true,
      validationSchema,
      validationOptions: {
        allowUnknown: true, // Allow other env vars not in schema
        abortEarly: false,
      },
    }),
  ],
  providers: [NestConfigService],
  exports: [NestConfigService],
})
export class NestConfigModule {}
