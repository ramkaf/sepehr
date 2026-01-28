import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PostgresModule,
  RedisModule,
  UserChart,
  UserComponentsConfig,
} from 'libs/database';
import { UserComponentConfigService } from './providers/user-component-config.service';
import { InsightModule } from '@app/modules/insight';
import { UserGlobalModule } from '../users/userGlobal.module';

@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([UserComponentsConfig]),
    RedisModule,
    forwardRef(() => InsightModule),
    UserGlobalModule,
  ],
  providers: [UserComponentConfigService],
  exports: [UserComponentConfigService],
})
export class UserComponentConfigModule {}
