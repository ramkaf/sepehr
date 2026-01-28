import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  ALARM_CONFIG_CREATE_PERMISSION,
  ALARM_CONFIG_PERMISSION,
  ALARM_CONFIG_READ_PERMISSION,
  ALARM_CONFIG_REMOVE_PERMISSION,
  ALARM_CONFIG_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { AlarmConfigService } from 'libs/modules';
import {
  CreateAlarmConfigDto,
  PlantUuidDto,
  UpdateAlarmConfigDto,
  UuidDto,
} from 'libs/dtos';

@Auth()
@Controller('/admin/alarm-config')
@ApiTags('alarm configs')
@ControllerPermission(ALARM_CONFIG_PERMISSION)
export class AlarmConfigController {
  constructor(private readonly alarmConfigService: AlarmConfigService) {}

  @Get('/plant/:plantUuid')
  @RequiresPermission(ALARM_CONFIG_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant alarm configs')
  async find(@Param() plantUuidDto: PlantUuidDto) {
    return await this.alarmConfigService.getPlantAlarmConfigs(plantUuidDto);
  }

  @Get('/:uuid')
  @RequiresPermission(ALARM_CONFIG_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read one alarm config')
  async findOne(@Param() uuidDTO: UuidDto) {
    const { uuid } = uuidDTO;
    return await this.alarmConfigService.findOne(uuid);
  }

  @Post()
  @RequiresPermission(ALARM_CONFIG_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create one alarm config')
  async create(@Body() createAlarmConfigDto: CreateAlarmConfigDto) {
    return await this.alarmConfigService.add(createAlarmConfigDto);
  }

  @Patch()
  @RequiresPermission(ALARM_CONFIG_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one alarm config')
  async update(@Body() updateAlarmConfigDto: UpdateAlarmConfigDto) {
    return await this.alarmConfigService.modify(updateAlarmConfigDto);
  }

  @Delete('/:uuid')
  @RequiresPermission(ALARM_CONFIG_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete one alarm config')
  async delete(@Param() uuidDTO: UuidDto) {
    return await this.alarmConfigService.remove(uuidDTO);
  }
}
