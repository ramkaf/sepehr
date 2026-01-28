import {
  CreateDeviceWarrantyDto,
  UpdateDeviceWarrantyDto,
} from '@app/dtos/maintenance';
import { MaintenanceWarrantiesService } from '@app/modules/entity-management/maintenance/providers/maintenance-warranties.service';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EntityIdDto } from 'libs/dtos';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  WARRANTY_CREATE_PERMISSION,
  WARRANTY_PERMISSION,
  WARRANTY_READ_PERMISSION,
  WARRANTY_UPDATE_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';

@Auth()
@ApiTags('warranty')
// @ControllerPermission(WARRANTY_PERMISSION)
@Controller('maintenance/device')
export class WarrantyController {
  constructor(
    private readonly maintenanceWarrantiesService: MaintenanceWarrantiesService,
  ) {}

  @Post('/:entity_id/warranty')
  // @RequiresPermission(WARRANTY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create warranty for a device')
  async addDeviceWarranty(
    @Param() entityIdDto: EntityIdDto,
    @Body() createDeviceWarrantyDto: CreateDeviceWarrantyDto,
  ) {
    const { entity_id } = entityIdDto;
    return await this.maintenanceWarrantiesService.addDeviceWarranty(
      entity_id,
      createDeviceWarrantyDto,
    );
  }

  @Get('/:entity_id/warranty')
  // @RequiresPermission(WARRANTY_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find device warranty')
  async fetchDeviceWarranty(@Param() entityIdDto: EntityIdDto) {
    const { entity_id } = entityIdDto;
    return await this.maintenanceWarrantiesService.fetchDeviceWarranty(
      entity_id,
    );
  }

  @Put('/:entity_id/warranty')
  // @RequiresPermission(WARRANTY_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCreateOperationWithDocs('update device warranty')
  async update(
    @Param() entityIdDto: EntityIdDto,
    @Body() updateDeviceWarrantyDto: UpdateDeviceWarrantyDto,
  ) {
    const { entity_id } = entityIdDto;
    await this.maintenanceWarrantiesService.modify(
      entity_id,
      updateDeviceWarrantyDto,
    );
  }
}
