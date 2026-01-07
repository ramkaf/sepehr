import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NestConfigModule } from 'libs/config';
import { AccessType, PostgresModule, RedisModule, User } from 'libs/database';
import { UserGlobalService } from './userGlobal.service';

@Module({
  imports: [
    NestConfigModule,
    PostgresModule,
    TypeOrmModule.forFeature([User, AccessType]),
    RedisModule,
  ],
  providers: [UserGlobalService],
  exports: [UserGlobalService],
})
export class UserGlobalModule {}
