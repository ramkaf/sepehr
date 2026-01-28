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
import {
  CompanyIdDto,
  CreateCompanyDto,
  PlantIdDto,
  PlantWithCompanyDto,
  UpdateCompanyDto,
} from 'libs/dtos';
import { CompanyService } from 'libs/modules';
import type { Request } from 'express';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  COMPANY_PERMISSION,
  COMPANY_READ_PERMISSION,
  COMPANY_CREATE_PERMISSION,
  COMPANY_REMOVE_PERMISSION,
  COMPANY_UPDATE_PERMISSION,
} from 'src/rbac/constants';

@Auth()
@ApiTags('company')
// @ControllerPermission(COMPANY_PERMISSION)
@Controller('/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}
  @Get()
  // @RequiresPermission(COMPANY_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find one parameters')
  async get(
    @Req() request: Request,
    @Query('include_plants') include_plants?: boolean,
  ) {
    const { id } = request.user!;
    const includePlants = include_plants ?? false;
    return await this.companyService.userCompanies(id, includePlants);
  }

  @Get('/:company_id/plants')
  // @RequiresPermission(COMPANY_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find plants companies')
  async getCompanyPlants(
    @Req() request: Request,
    @Param() companyIdDto: CompanyIdDto,
  ) {
    const { id } = request.user!;
    const { company_id } = companyIdDto;
    return await this.companyService.getCompanyPlants(id, company_id);
  }

  @Post()
  // @RequiresPermission(COMPANY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('create plant company')
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companyService.add(createCompanyDto);
  }

  @Put('/:company_id')
  // @RequiresPermission(COMPANY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update plant company')
  async update(
    @Param() companyIdDto: CompanyIdDto,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.companyService.modify(companyIdDto, updateCompanyDto);
  }

  @Post('/:company_id/plants')
  // @RequiresPermission(COMPANY_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('assign company to plant')
  async assign(
    @Req() request: Request,
    @Param() companyIdDto: CompanyIdDto,
    @Body() plantIdDto: PlantIdDto,
  ) {
    const { id: userUuid } = request.user!;
    const { company_id } = companyIdDto;
    const { plant_id } = plantIdDto;
    return await this.companyService.assignPlantToCompany(
      userUuid,
      company_id,
      plant_id,
    );
  }

  @Delete('/:company_id/plants/:plant_id')
  // @RequiresPermission(COMPANY_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('remove plant from company')
  async removePlantFromCompany(
    @Req() request: Request,
    @Param() plantWithCompanyDto: PlantWithCompanyDto,
  ) {
    const { id: userUuid } = request.user!;
    const { company_id, plant_id } = plantWithCompanyDto;
    return await this.companyService.removePlantFromCompany(
      userUuid,
      company_id,
      plant_id,
    );
  }
}
