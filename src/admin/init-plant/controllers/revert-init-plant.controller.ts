import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { RevertInitPlantService } from '../providers/revert-init-plant.service';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  REVERT_INIT_CONFIRMATION_PERMISSION,
  REVERT_INIT_PLANT_DISCARD_ALL,
  REVERT_INIT_PLANT_INSERT_ENTITIES_PERMISSION,
  REVERT_INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION,
  REVERT_INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION,
  REVERT_INIT_PLANT_INSERT_SOURCES_PERMISSION,
  REVERT_INIT_PLANT_PERMISSION,
  REVERT_INIT_PLANT_TABLES_AND_LINKS_PERMISSION,
  REVERT_INIT_PLANT_TAG_CREATE_PERMISSION,
} from '../../../rbac/constants';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { ApiTags } from '@nestjs/swagger';
import { PlantUuidDto, RevertInitializedByEntityTypeDto } from 'libs/dtos';

@Auth()
@Controller('/admin/init-plant/revert')
@ApiTags('revert setup plant')
@ControllerPermission(REVERT_INIT_PLANT_PERMISSION)
export class RevertInitPlantContrller {
  constructor(
    private readonly revertInitPlantService: RevertInitPlantService,
  ) {}

  @Post('/plant-tag/:plantUuid')
  @ApiCreateOperationWithDocs('revert plant entity with tag, type, and fields')
  @RequiresPermission(REVERT_INIT_PLANT_TAG_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertPlantEntityWithTypeAndFields(
    @Param() plantUuidDto: PlantUuidDto,
  ) {
    return this.revertInitPlantService.revertInitPlantTag(plantUuidDto);
  }

  @Post('/sources/:plantUuid')
  @ApiCreateOperationWithDocs('revert sources and devices for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_SOURCES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertConfirmSourceAndDevices(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitSources(plantUuidDto);
  }

  @Post('/confirm-source-with-devices/:plantUuid')
  @RequiresPermission(REVERT_INIT_CONFIRMATION_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('revert confirm device with sources')
  async revertConfirmDevicesWithSources(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertConfirmDeviceWithSources(
      plantUuidDto,
    );
  }

  @Post('entity-types/:plantUuid')
  @ApiCreateOperationWithDocs('revert entity types for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITY_TYPES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertEntityTypes(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitEntityTypes(
      plantUuidDto,
    );
  }

  // @Post('entities/all/:plantUuid')
  // @ApiCreateOperationWithDocs('revert entities for a plant')
  // @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITIES_PERMISSION)
  // @HttpCode(HttpStatus.OK)
  // async revertEntities(@Param() plantUuidDto: PlantUuidDto) {
  //   return await this.revertInitPlantService.revertInitEntities(plantUuidDto);
  // }

  @Post('entities/all/:plantUuid')
  @ApiCreateOperationWithDocs('revert entities for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITIES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertEntities(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitEntitiesStep(
      plantUuidDto,
    );
  }
  @Post('entities/by-entity-type')
  @ApiCreateOperationWithDocs('revert entities for a plant by entity Types')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITIES_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertEntitiesByType(
    @Body() revertInitializedByEntityTypeDto: RevertInitializedByEntityTypeDto,
  ) {
    return await this.revertInitPlantService.revertInitializedEntitiesByType(
      revertInitializedByEntityTypeDto,
    );
  }

  @Post('entity-fields/:plantUuid')
  @ApiCreateOperationWithDocs('revert initialized entity fields for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertInitializedFields(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitEntityFieldStep(
      plantUuidDto,
    );
  }

  @Post('entity-fields')
  @ApiCreateOperationWithDocs('revert initialized entity fields by type')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertInitializedFieldsByType(
    @Body() revertInitializedByEntityTypeDto: RevertInitializedByEntityTypeDto,
  ) {
    return await this.revertInitPlantService.revertInitializedFieldsByType(
      revertInitializedByEntityTypeDto,
    );
  }

  @Post('static-fields/:plantUuid')
  @ApiCreateOperationWithDocs('revert all static fields for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertAllStaticFields(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitStaticParameters(
      plantUuidDto,
    );
  }

  @Post('computational-fields/:plantUuid')
  @ApiCreateOperationWithDocs('revert all computational fields for a plant')
  @RequiresPermission(REVERT_INIT_PLANT_INSERT_ENTITY_FIELDS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertAllComputationalFields(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertInitComputationalParameters(
      plantUuidDto,
    );
  }

  @Post('/revert-tables-and-revert-admin-links/:plantUuid')
  @ApiCreateOperationWithDocs('revert plant tables and admin links')
  @RequiresPermission(REVERT_INIT_PLANT_TABLES_AND_LINKS_PERMISSION)
  @HttpCode(HttpStatus.OK)
  async revertStatusTables(@Param() plantUuidDto: PlantUuidDto) {
    return await this.revertInitPlantService.revertAlertTablesAndAdminPlantAppend(
      plantUuidDto,
    );
  }

  @Post('/discard-all/:plantUuid')
  @ApiCreateOperationWithDocs('discard all plant setup')
  @RequiresPermission(REVERT_INIT_PLANT_DISCARD_ALL)
  @HttpCode(HttpStatus.OK)
  async discartAll(@Param() plantUuidDto: PlantUuidDto) {
    this.revertInitPlantService
      .revertAll(plantUuidDto)
      .then(() => {
        console.log(`Revert all finished for plant ${plantUuidDto.plantUuid}`);
      })
      .catch((error) => {
        console.error(
          `Error in revertAll for plant ${plantUuidDto.plantUuid}:`,
          error,
        );
      });
    return true;
  }
}
