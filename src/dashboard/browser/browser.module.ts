import { Module } from '@nestjs/common';
import { BrowserService } from './providers/browser.service';
import { BrowserController } from './controllers/browser.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookmarkField,
  ElasticModule,
  PostgresModule,
  RedisModule,
} from 'libs/database';
import {
  EntityFieldsModule,
  EntityModule,
  EntityTypesModule,
  InsightModule,
  PowerPlantServiceModule,
  SourceModule,
  UserGlobalModule,
} from 'libs/modules';
import { NestConfigModule } from 'libs/config';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    ElasticModule.register(),
    TypeOrmModule.forFeature([BookmarkField]),
    RedisModule,
    InsightModule,
    EntityFieldsModule,
    EntityTypesModule,
    EntityModule,
    UserGlobalModule,
    PowerPlantServiceModule,
  ],
  controllers: [BrowserController],
  exports: [BrowserService],
  providers: [BrowserService],
})
export class BrowserModule {}
