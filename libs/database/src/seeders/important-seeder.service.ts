// src/seeder/important-seeder.service.ts
import { Injectable } from '@nestjs/common';
import { AccessTypeSeeder } from './important-seeder/access-type.seeder.service';
import { SettingSectionSeeder } from './important-seeder/setting-section.seeder.service';
import { SettingSeeder } from './important-seeder/setting.seeder.service';
import { AccessTypeSettingSeeder } from './important-seeder/access-type-setting.seeder.service';
import { PermissionSeeder } from './important-seeder/permissions.seeder.service';
import { RoleSeeder } from './important-seeder/role.seeder.service';
import { RolePermissionSeeder } from './important-seeder/role-permission.service';
import { UserSeeder } from './important-seeder/users.seeder.service';
import { EntityFieldSchemaSeeder } from './important-seeder/entity-field-schema.seeder.service';

@Injectable()
export class ImportantSeederService {
  constructor(
    private readonly accessTypeSeeder: AccessTypeSeeder,
    private readonly settingSectionSeeder: SettingSectionSeeder,
    private readonly settingSeeder: SettingSeeder,
    private readonly accessTypeSettingSeeder: AccessTypeSettingSeeder,
    private readonly permissionSeeder: PermissionSeeder,
    private readonly roleSeeder: RoleSeeder,
    private readonly rolePermissionSeeder: RolePermissionSeeder,
    private readonly userSeeder: UserSeeder,
    private readonly EntityFieldSchemaSeeder: EntityFieldSchemaSeeder,
  ) {}

  async seedImportant() {
    await this.accessTypeSeeder.seed();
    await this.settingSectionSeeder.seed();
    await this.settingSeeder.seed();
    await this.accessTypeSettingSeeder.seed();
    await this.permissionSeeder.seed();
    await this.roleSeeder.seed();
    await this.rolePermissionSeeder.seed();
    await this.userSeeder.seed();
    await this.EntityFieldSchemaSeeder.seed();
  }
}
