import { Module } from '@nestjs/common';
import { SettingService } from './providers/setting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessTypeService } from './providers/access-type.service';
import {
  AccessType,
  AccessTypeSetting,
  PostgresModule,
  RedisModule,
  Settings,
} from 'libs/database';
import { NestConfigModule } from 'libs/config';
@Module({
  imports: [
    NestConfigModule,
    RedisModule,
    PostgresModule,
    TypeOrmModule.forFeature([AccessType, Settings, AccessTypeSetting]),
  ],
  providers: [SettingService, AccessTypeService],
  exports: [SettingService, AccessTypeService],
})
export class SettingModule {}
