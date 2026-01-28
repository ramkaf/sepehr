import {
  CreateCompanyWareHouseDto,
  UpdateCompanyWareHouseDto,
} from '@app/dtos/warehouse';
import {
  Body,
  Controller,
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
  COMPANY_WAREHOUSE_PERMISSION,
  COMPANY_WAREHOUSE_READ_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';
import type { Request } from 'express';
import { CompanyIdDto, CompanyWarehouseIdDto } from 'libs/dtos';
import { CompanyWareHouseService } from 'libs/modules';

@Auth()
@ApiTags('company-warehouse')
// @ControllerPermission(COMPANY_WAREHOUSE_PERMISSION)
@Controller('warehouse')
export class CompanyWareHouseController {
  constructor(
    private readonly companyWareHouseService: CompanyWareHouseService,
  ) {}

  @Post()
  // @RequiresPermission(COMPANY_WAREHOUSE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('create company warehouse')
  async create(
    @Req() request: Request,
    @Body() createCompanyWareHouseDto: CreateCompanyWareHouseDto,
  ) {
    const { id } = request.user!;
    return await this.companyWareHouseService.createCompanyWarehouse(
      id,
      createCompanyWareHouseDto,
    );
  }

  @Get()
  // @RequiresPermission(COMPANY_WAREHOUSE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('get company warehouses')
  async get(@Req() request: Request, @Query() companyIdDto: CompanyIdDto) {
    const { id } = request.user!;
    const { company_id } = companyIdDto;
    return await this.companyWareHouseService.fetch(id, company_id);
  }

  @Put('/:warehouse_id')
  // @RequiresPermission(COMPANY_WAREHOUSE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update company warehouse')
  async update(
    @Req() request: Request,
    @Param() companyWarehouseIdDto: CompanyWarehouseIdDto,
    @Body() updateCompanyWareHouseDto: UpdateCompanyWareHouseDto,
  ) {
    const { id } = request.user!;
    const { warehouse_id } = companyWarehouseIdDto;
    return await this.companyWareHouseService.updateCompanyWareHouse(
      id,
      warehouse_id,
      updateCompanyWareHouseDto,
    );
  }
}
