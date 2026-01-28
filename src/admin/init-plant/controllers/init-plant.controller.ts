import {
  Controller,
  Body,
  Post,
  Get,
  Param,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { InitPlantService } from '../providers/init-plant.service';
import {
  CreateUpdateMultipleSourceDto,
  InitPlantTagDto,
  PlantUuidDto,
  InitMultpleStaticParametersDto,
  InitMultpleComputationalParametersDto,
  InitMultiplePlantEntityTypesDto,
  InitMultiplePlantEntityDto,
  InitPlantNonComputationalParametersDto,
} from 'libs/dtos';
import {
  INIT_PLANT_INSERT_ENTITIES_PERMISSION,
  INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION,
  INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION,
  INIT_PLANT_INSERT_SOURCES_PERMISSION,
  INIT_PLANT_PERMISSION,
  INIT_PLANT_READ_PERMISSION,
  INIT_PLANT_TABLES_AND_LINKS_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { ApiTags } from '@nestjs/swagger';
import { EntityModel, EntityType } from 'libs/database';
import { IFirstStepCredentials } from 'libs/interfaces';

@Auth()
@Controller('/admin/init-plant/init')
@ApiTags('setup new plant api')
@ControllerPermission(INIT_PLANT_PERMISSION)
export class InitPlantController {
  constructor(private readonly initPlantService: InitPlantService) {}

  @Get('/get-plant-with-setup-step/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('get One Plant With thier setup step')
  async getPlantWithSetupStep(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.fetchOnePlantWithSetupStep(plantUuidDto);
  }

  @Get('/get-plants-with-setup-step')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('get all Plants With thier setup step')
  async getPlantsWithSetupStep() {
    return await this.initPlantService.fetchAllPlantWithSetupStep();
  }

  @Get('/get-elastic-indexes')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Read all elastic indexes')
  async getFirstStepPlantSetupCredentials(): Promise<IFirstStepCredentials> {
    return await this.initPlantService.getElasticIndexes();
  }

  @Post('/plant-tag')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('Initialize a new plant tag')
  async initPlantTag(
    @Body() initplantTagDto: InitPlantTagDto,
  ): Promise<EntityModel> {
    return await this.initPlantService.initPlantTag(initplantTagDto);
  }

  @Get('/get-sources/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Get all sources of a plant by UUID')
  async getSources(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.getSources(plantUuidDto);
  }

  @Post('/sources')
  @RequiresPermission(INIT_PLANT_INSERT_SOURCES_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('Init or modify multiple sources')
  async insertOrModify(
    @Body() createUpdateMultipleSourceDto: CreateUpdateMultipleSourceDto,
  ) {
    return await this.initPlantService.insertOrUpdateSources(
      createUpdateMultipleSourceDto,
    );
  }

  @Get('/get-source-with-devices/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Get sources along with devices of a plant')
  async getDevicesWithSources(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.getDevicesWithSources(plantUuidDto);
  }

  @Post('/confirm-source-with-devices/:plantUuid')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Confirm device assignments with sources')
  async confirmDevicesWithSources(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.confirmDeviceWithSources(plantUuidDto);
  }

  @Get('/get-source-with-devices-with-all-entity-types/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Get sources along with devices with all entityTypes',
  )
  async getSourcesWithDevicesAndAllEntityTypes(
    @Param() plantUuidDto: PlantUuidDto,
  ) {
    return await this.initPlantService.getDevicesWithSourcesWithEnitityTypes(
      plantUuidDto,
    );
  }

  @Get('/get-entity-type-with-fields/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Get parameters along with entity Types  with all entityTypes',
  )
  async getEntityTypeWithParameters(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.getParametersOfEntityTypes(plantUuidDto);
  }
  @Post('/entity-types')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('Init multiple entity types for the plant')
  async insertAllEntityTypes(
    @Body() initMultiplePlantEntityTypesDto: InitMultiplePlantEntityTypesDto,
  ): Promise<EntityType[]> {
    return await this.initPlantService.initPlantEntityTypes(
      initMultiplePlantEntityTypesDto,
    );
  }

  // @Get('/get-entity-types-with-their-entities/:plantUuid')
  // @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  // @HttpCode(HttpStatus.OK)
  // @ApiCreateOperationWithDocs(
  //   'Get entity Types along with entities'
  // )
  // async getEntityTypeWithEntities(@Param() plantUuidDto: PlantUuidDto) {
  //   return await this.initPlantService.getEntityTypeWithEntites(plantUuidDto);
  // }

  @Get('/report-entity-types-with-their-entities/:plantUuid')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'report status of entity Types along with entities',
  )
  async reportEntityTypeWithEntities(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.getEntityTypeDeviceReport(plantUuidDto);
  }

  @Post('/pending-entities')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITIES_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('Init multiple entities for the plant')
  async insertAllEntities(
    @Body() initMultiplePlantEntityDto: InitMultiplePlantEntityDto,
  ): Promise<boolean> {
    return await this.initPlantService.initPlantEntites(
      initMultiplePlantEntityDto,
    );
  }

  @Post('/entities/:plantUuid')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Confirm insert entities')
  async confirmInitEntities(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.confirmInitPlantEntities(plantUuidDto);
  }

  @Post('/pending-entity-fields')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('Init entity fields for the plant')
  async insertAllEntityFields(
    @Body() initPlantEntityFieldsDto: InitPlantNonComputationalParametersDto,
  ): Promise<boolean> {
    return await this.initPlantService.initPlantNonComputationalParameters(
      initPlantEntityFieldsDto,
    );
  }

  @Post('/entity-fields/:plantUuid')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Confirm device assignments with sources')
  async confirmInitEntityFields(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.confirmInitPlantEntityFields(
      plantUuidDto,
    );
  }

  @Get('/static-fields')
  @ApiCreateOperationWithDocs('read static parameters')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async getStaticParamters() {
    return await this.initPlantService.fetchStaticParametersSchema();
  }

  @Post('/static-fields')
  @ApiCreateOperationWithDocs('init static parameters')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  async setStaticParametersValue(
    @Body() initMultpleStaticParametersDto: InitMultpleStaticParametersDto,
  ) {
    return await this.initPlantService.initStaticParameters(
      initMultpleStaticParametersDto,
    );
  }

  @Get('/computational-fields')
  @ApiCreateOperationWithDocs('read computational parameters of a plant')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async getComputationalParamters() {
    return await this.initPlantService.fetchComputationalParameters();
  }

  @Post('/computational-fields')
  @ApiCreateOperationWithDocs('insert computational parameters for plant')
  @RequiresPermission(INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  async insertComputationalParameters(
    @Body()
    initMultpleComputationalParametersDto: InitMultpleComputationalParametersDto,
  ) {
    return await this.initPlantService.initComputationalParameters(
      initMultpleComputationalParametersDto,
    );
  }

  @Get('/report-plant-setup/:plantUuid')
  @ApiCreateOperationWithDocs('get report of plant setup appended to admins')
  @RequiresPermission(INIT_PLANT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async appendToAdmins(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.plantSetupReport(plantUuidDto);
  }

  @Post('/create-tables-and-append-to-admins/:plantUuid')
  @ApiCreateOperationWithDocs(
    'create plant states , status and events tables and append to admins',
  )
  @RequiresPermission(INIT_PLANT_TABLES_AND_LINKS_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  async createTablesAndappendToAdmins(@Param() plantUuidDto: PlantUuidDto) {
    return await this.initPlantService.initTablesAndAppendToAdmin(plantUuidDto);
  }
}
