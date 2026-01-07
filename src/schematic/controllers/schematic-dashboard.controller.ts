import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiCreateOperationWithDocs, Auth } from '../../document';
import { SchematicService } from '../providers/schematic.service';
import { ApiTags } from '@nestjs/swagger';
import {
  EntityUuidDto,
  GetSchematicsDto,
  PlantUuidDto,
  UpsertSchematicDto,
  UuidDto,
} from 'libs/dtos';
import type { Request } from 'express';

@Auth()
@ApiTags('schematic-apis')
@Controller('/dashboard/schematic')
export class SchematicDashboardController {
  constructor(private readonly schematicService: SchematicService) {}

  @Get('/get-schematics')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Retrieve all existing schematics')
  async findAllSchematics(@Query() getSchematicsDto: GetSchematicsDto) {
    return await this.schematicService.getSchematics(getSchematicsDto);
  }

  @Get('/get-Schematic-category/:plantUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Retrieve all existing schematics')
  async fetchSchematicCategories(@Param() plantUuidDto: PlantUuidDto) {
    return await this.schematicService.fetchCategories(plantUuidDto);
  }

  @Get('/get-entity-type-with-schematic-category/:plantUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Retrieve all existing schematics')
  async fetchEntityTypeWithSchematicCategories(
    @Param() plantUuidDto: PlantUuidDto,
  ) {
    return await this.schematicService.fetchEntityTypeWithSchematicCategoriesOfAPlant(
      plantUuidDto,
    );
  }

  @Get('fetch-entity-field-and-states/:eUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Retrieve all entity fields along with their associated states and permissions',
  )
  async findAllEntityFieldsAndStates(
    @Req() request: Request,
    @Param() entityUuidDto: EntityUuidDto,
  ) {
    return await this.schematicService.getDeviceParametersWithStates(
      request,
      entityUuidDto,
    );
  }

  @Post('upsert-schematic')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs(
    'Create a new schematic or update an existing one',
  )
  async upsertSchematic(@Body() upsertSchematicDto: UpsertSchematicDto) {
    return await this.schematicService.upsertSchematic(upsertSchematicDto);
  }

  @Delete('delete-schematic/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Delete an existing schematic and remove its related configurations',
  )
  async deleteSchematic(@Param() uuidDto: UuidDto) {
    await this.schematicService.deleteSchematics(uuidDto);
  }

  @Delete('delete-schematic-category/:uuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Delete an existing schematic and remove its related configurations',
  )
  async deleteSchematicCategory(@Param() uuidDto: UuidDto) {
    await this.schematicService.deleteCategory(uuidDto);
  }
}
