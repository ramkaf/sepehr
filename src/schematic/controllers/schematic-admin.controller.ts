import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCreateOperationWithDocs, Auth } from '../../document';
import { SchematicService } from '../providers/schematic.service';
import {
  SCHEMATIC_ADMIN_PERMISSION,
  SCHEMATIC_CATEGORY_CREATE_PERMISSION,
  SCHEMATIC_CATEGORY_UPDATE_PERMISSION,
  SCHEMATIC_READ_PERMISSION,
} from '../../rbac/constants/schematic.permission';
import { ControllerPermission } from '../../rbac/decorators/requires-permission.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  AppendSchematicEntityTypeDto,
  CreateSchematicCategoryDto,
  PlantUuidDto,
  UpdateSchematicCategoryDto,
} from 'libs/dtos';

@Auth()
@Controller('/admin/schematic')
@ApiTags('schematic-apis')
@ControllerPermission(SCHEMATIC_ADMIN_PERMISSION)
@Controller()
export class SchematicAdminController {
  constructor(private readonly schematicService: SchematicService) {}

  @Post('insert-schematic-category')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs(
    'Create a new schematic or update an existing one',
  )
  @ControllerPermission(SCHEMATIC_CATEGORY_CREATE_PERMISSION)
  insertSchematicCategory(
    @Body() createSchematicCategoryDto: CreateSchematicCategoryDto,
  ) {
    return this.schematicService.addSchematicCategory(
      createSchematicCategoryDto,
    );
  }

  @Patch('update-Schematic-category')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Retrieve all entity fields along with their associated states and permissions',
  )
  @ControllerPermission(SCHEMATIC_CATEGORY_UPDATE_PERMISSION)
  updateSchematicCategory(
    @Body() updateSchematicCategoryDto: UpdateSchematicCategoryDto,
  ) {
    return this.schematicService.updateCategory(updateSchematicCategoryDto);
  }

  @Get('/get-Schematic-category/:plantUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('Retrieve all existing schematics')
  fetchSchematicCategories(@Param() plantUuidDto: PlantUuidDto) {
    return this.schematicService.fetchCategories(plantUuidDto);
  }

  @Patch('append-schematic-category-to-entity-type/:eUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'Retrieve all entity fields along with their associated states and permissions',
  )
  @ControllerPermission(SCHEMATIC_READ_PERMISSION)
  appendSchematicCategoryToEntityType(
    @Body() appendSchematicEntityTypeDto: AppendSchematicEntityTypeDto,
  ) {
    return this.schematicService.appendSchematicToEntityType(
      appendSchematicEntityTypeDto,
    );
  }
}
