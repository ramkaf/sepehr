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
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  WAREHOUSE_DEVICE_PERMISSION,
  WAREHOUSE_DEVICE_READ_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';
import type { Request } from 'express';
import { CreateWareHouseDeviceDto } from '@app/dtos/warehouse/warehouse-devices/create-warehouse-device.dto';
import { WarehouseDeviceService } from 'libs/modules';
import { CompanyWarehouseUuidDto } from '@app/dtos/generals-uuid/company-warehouse-uuid.dto';
import {
  WareHouseWithDeviceDto,
  UpdateWareHouseDeviceDto,
} from '@app/dtos/warehouse';
import { CompanyWarehouseIdDto, WarehouseDeviceUuidDto } from 'libs/dtos';

@Auth()
@ApiTags('warehouse-device')
// @ControllerPermission(WAREHOUSE_DEVICE_PERMISSION)
@Controller('warehouses')
export class WareHouseDeviceController {
  constructor(
    private readonly wareHouseDeviceService: WarehouseDeviceService,
  ) {}

  @Get('/:warehouse_id/devices')
  // @RequiresPermission(WAREHOUSE_DEVICE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('fetch warehouse devices')
  async get(
    @Req() request: Request,
    @Param() companyWarehouseIdDto: CompanyWarehouseIdDto,
    @Query('include_removed') includeRemoved?: boolean,
  ) {
    const { id } = request.user!;
    const includeRemovedObj = includeRemoved ? includeRemoved : false;
    return await this.wareHouseDeviceService.fetchWarehouseDevices(
      id,
      companyWarehouseIdDto,
      includeRemovedObj,
    );
  }

  @Post()
  @RequiresPermission(WAREHOUSE_DEVICE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('create warehouse devices')
  async create(@Body() createWareHouseDeviceDto: CreateWareHouseDeviceDto) {
    return await this.wareHouseDeviceService.createWarehouseDevices(
      createWareHouseDeviceDto,
    );
  }

  @Put('/:warehouse_id/devices/:device_id')
  @RequiresPermission(WAREHOUSE_DEVICE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update company warehouses')
  async put(
    @Req() request: Request,
    @Param() WareHouseWithDeviceDto: WareHouseWithDeviceDto,
    @Body() updateWareHouseDeviceDto: UpdateWareHouseDeviceDto,
  ) {
    const { id } = request.user!;
    const { warehouse_id, device_id } = WareHouseWithDeviceDto;
    return await this.wareHouseDeviceService.updateWareHouseDevices(
      id,
      warehouse_id,
      device_id,
      updateWareHouseDeviceDto,
    );
  }

  @Delete()
  @RequiresPermission(WAREHOUSE_DEVICE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update company warehouses')
  async delete(
    @Req() request: Request,
    @Param() WareHouseWithDeviceDto: WareHouseWithDeviceDto,
  ) {
    const { id } = request.user!;
    const { warehouse_id, device_id } = WareHouseWithDeviceDto;
    return await this.wareHouseDeviceService.removeWareHouseDevices(
      id,
      warehouse_id,
      device_id,
    );
  }
}
