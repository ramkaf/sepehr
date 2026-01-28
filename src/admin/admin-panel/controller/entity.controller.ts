import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  CreateEntityDto,
  UpdateEntityDto,
  CreateMultipleEntityDto,
  UpdateMultipleEntityDto,
  UuidDto,
  MultipleUuidDto,
  PlantUuidDto,
  EntityTypeUuidDto,
} from 'libs/dtos';
import {
  ENTITY_CREATE_PERMISSION,
  ENTITY_PERMISSION,
  ENTITY_READ_PERMISSION,
  ENTITY_REMOVE_PERMISSION,
  ENTITY_UPDATE_PERMISSION,
} from './../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { EntityBaseService } from 'libs/modules';

@Auth()
@Controller('admin/entity')
@ApiTags('entities')
@ControllerPermission(ENTITY_PERMISSION)
export class EntityController {
  constructor(private readonly entityBaseService: EntityBaseService) {}

  @Get('/plant/:plantUuid')
  @RequiresPermission(ENTITY_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant entities')
  async findPlantEntities(@Param() plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    return await this.entityBaseService.findPlantEntites(plantUuid);
  }

  @Get('/entity-type/:etUuid')
  @RequiresPermission(ENTITY_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read entity type entities')
  async findEntityTypeEntities(@Param() entityTypeUuidDto: EntityTypeUuidDto) {
    return await this.entityBaseService.findEntityTypeEntities(
      entityTypeUuidDto,
    );
  }

  @Post()
  @RequiresPermission(ENTITY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create one entity')
  async create(@Body() createEntityDto: CreateEntityDto) {
    return await this.entityBaseService.add(createEntityDto);
  }

  @Post('/many')
  @RequiresPermission(ENTITY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create many entities')
  async createMany(@Body() createEntityArrayDto: CreateMultipleEntityDto) {
    return await this.entityBaseService.addMany(createEntityArrayDto);
  }

  @Patch()
  @RequiresPermission(ENTITY_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one entity')
  async update(@Body() updateEntityDto: UpdateEntityDto) {
    return await this.entityBaseService.modify(updateEntityDto);
  }
  @Patch('/many')
  @RequiresPermission(ENTITY_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update many enitiies')
  async updateMany(@Body() updateEntityDto: UpdateMultipleEntityDto) {
    return await this.entityBaseService.modifyMany(updateEntityDto);
  }

  @Delete('/one/:uuid')
  @RequiresPermission(ENTITY_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete one entity')
  async delete(@Param() uuidDTO: UuidDto) {
    return await this.entityBaseService.remove(uuidDTO);
  }

  @Delete('/many')
  @RequiresPermission(ENTITY_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete many entites')
  async deleteMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.entityBaseService.removeMany(multipleUuidDto);
  }
}
