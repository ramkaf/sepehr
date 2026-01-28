import {
  Controller,
  Get,
  Body,
  Post,
  Patch,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  CreateMultipleEntityTypeDto,
  CreateEntityTypeDto,
  UpdateEntityTypeDto,
  UpdateMultipleEntityTypeDto,
  MultipleUuidDto,
  UuidDto,
  PlantUuidDto,
} from 'libs/dtos';
import { ISourceWithDevices } from 'libs/interfaces';
import {
  ENTITY_TYPE_CREATE_PERMISSION,
  ENTITY_TYPE_PERMISSION,
  ENTITY_TYPE_READ_PERMISSION,
  ENTITY_TYPE_REMOVE_PERMISSION,
  ENTITY_TYPE_UPDATE_PERMISSION,
} from './../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { EntityTypeBaseService } from 'libs/modules';

@Auth()
@Controller('/admin/entity-type')
@ApiTags('entity types')
@ControllerPermission(ENTITY_TYPE_PERMISSION)
export class EntityTypeController {
  constructor(private readonly entityTypeBaseService: EntityTypeBaseService) {}

  @Get('/:plantUuid')
  @RequiresPermission(ENTITY_TYPE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant entity types')
  async findPlantEntityTypes(@Param() plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    return await this.entityTypeBaseService.findPlantEntityTypes(plantUuid);
  }

  @Get('/one/:uuid')
  @RequiresPermission(ENTITY_TYPE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find entity Type by uuid')
  async findOne(@Param() uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return await this.entityTypeBaseService.findOne(uuid);
  }

  @Post()
  @RequiresPermission(ENTITY_TYPE_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create one entity type')
  async create(@Body() createEntityTypeDto: CreateEntityTypeDto) {
    return await this.entityTypeBaseService.add(createEntityTypeDto);
  }

  @Post('/many')
  @RequiresPermission(ENTITY_TYPE_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create many entity type')
  async createMany(
    @Body() createEntityTypeArrayDto: CreateMultipleEntityTypeDto,
  ) {
    return await this.entityTypeBaseService.addMany(createEntityTypeArrayDto);
  }

  @Patch()
  @RequiresPermission(ENTITY_TYPE_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one entity type')
  async update(@Body() updateEntityTypeDto: UpdateEntityTypeDto) {
    return await this.entityTypeBaseService.modify(updateEntityTypeDto);
  }

  @Patch('/many')
  @RequiresPermission(ENTITY_TYPE_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update many entity type')
  async updateMany(
    @Body() updateMultipleEntityTypeDto: UpdateMultipleEntityTypeDto,
  ) {
    return await this.entityTypeBaseService.modifyMany(
      updateMultipleEntityTypeDto,
    );
  }

  @Delete('/one/:uuid')
  @RequiresPermission(ENTITY_TYPE_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete one entity type')
  async delete(@Param() uuidDTO: UuidDto) {
    return await this.entityTypeBaseService.remove(uuidDTO);
  }

  @Delete('/many')
  @RequiresPermission(ENTITY_TYPE_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete multiple entity type')
  async deleteMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.entityTypeBaseService.removeMany(multipleUuidDto);
  }
}
