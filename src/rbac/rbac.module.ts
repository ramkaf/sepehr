import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './services/role.service';
import { PermissionService } from './services/permission.service';
import { PermissionGuard } from './guards/permission.guard';
import { UserModule } from '../user/user.module';
import {
  Permission,
  PostgresModule,
  RedisModule,
  Role,
  User,
} from 'libs/database';
@Module({
  imports: [
    PostgresModule,
    TypeOrmModule.forFeature([User, Role, Permission]),
    RedisModule,
    forwardRef(() => UserModule),
  ],
  providers: [RoleService, PermissionService, PermissionGuard],
  exports: [RoleService, PermissionService, PermissionGuard],
})
export class RbacModule {}
