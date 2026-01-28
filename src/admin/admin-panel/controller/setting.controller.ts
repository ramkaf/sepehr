import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UpdateSettingDto } from 'libs/dtos';
import { SettingService } from 'libs/modules';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  SETTING_PERMISSION,
  SETTING_READ_PERMISSION,
  SETTING_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';

@Auth()
@Controller('/admin/setting')
@ApiTags('settings')
@ControllerPermission(SETTING_PERMISSION)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  @RequiresPermission(SETTING_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'read settings with access types and their values',
  )
  @HttpCode(HttpStatus.OK)
  async get() {
    const settings = await this.settingService.getAccessTypeSettingTree();
    return settings;
  }

  @Patch()
  @RequiresPermission(SETTING_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('modify setting values')
  async update(@Body() updateSettingDto: UpdateSettingDto) {
    await this.settingService.update(updateSettingDto);
    return true;
  }
}
