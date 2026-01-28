import {
  CreateDeviceSpecDto,
  UpdateDeviceSpecDto,
} from '@app/dtos/maintenance';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeviceSpecIdDto, EntityTypeIdDto } from 'libs/dtos';
import { MaintenanceDeviceSpecService } from 'libs/modules';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  COMPANY_READ_PERMISSION,
  DEVICE_SPEC_CREATE_PERMISSION,
  DEVICE_SPEC_PERMISSION,
  DEVICE_SPEC_READ_PERMISSION,
  DEVICE_SPEC_REMOVE_PERMISSION,
  DEVICE_SPEC_UPDATE_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';

@Auth()
@ApiTags('device spec')
// @ControllerPermission(DEVICE_SPEC_PERMISSION)
@Controller('/maintenance/device')
export class DeviceSpecController {
  constructor(
    private readonly maintenanceDeviceSpecService: MaintenanceDeviceSpecService,
  ) {}

  @Get('/:entity_type_id/specs')
  // @RequiresPermission(DEVICE_SPEC_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find entity type device spec')
  async get(@Param() entityTypeIdDto: EntityTypeIdDto) {
    const { entity_type_id } = entityTypeIdDto;
    return this.maintenanceDeviceSpecService.findDeviceSpecification(
      entity_type_id,
    );
  }

  @Post('/:entity_type_id/specs')
  // @RequiresPermission(DEVICE_SPEC_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('create entity type device spec')
  async add(
    @Param() entityTypeIdDto: EntityTypeIdDto,
    @Body() createDeviceSpecDto: CreateDeviceSpecDto,
  ) {
    return await this.maintenanceDeviceSpecService.add(
      entityTypeIdDto,
      createDeviceSpecDto,
    );
  }

  @Put('specs/:ds_id')
  // @RequiresPermission(DEVICE_SPEC_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update entity type device spec')
  async update(
    @Param() deviceSpecIdDto: DeviceSpecIdDto,
    @Body() updateDeviceSpecDto: UpdateDeviceSpecDto,
  ) {
    return await this.maintenanceDeviceSpecService.modify(
      deviceSpecIdDto,
      updateDeviceSpecDto,
    );
  }

  @Delete('specs/:ds_id')
  // @RequiresPermission(DEVICE_SPEC_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete entity type device spec')
  async delete(@Param() deviceSpecIdDto: DeviceSpecIdDto) {
    return await this.maintenanceDeviceSpecService.remove(deviceSpecIdDto);
  }
}
