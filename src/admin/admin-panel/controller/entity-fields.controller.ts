import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateMultipleEntityFieldDto,
  CreateEntityFieldDto,
  UpdateEntityFieldDto,
  UpdateMultipleEntityFieldDto,
  UuidDto,
  MultipleUuidDto,
  PlantUuidDto,
  EntityTypeUuidDto,
} from 'libs/dtos';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  ENTITY_FIELD_CREATE_PERMISSION,
  ENTITY_FIELD_READ_PERMISSION,
  ENTITY_FIELD_REMOVE_PERMISSION,
  ENTITY_FIELD_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { BrowserGroupService, EntityFieldBaseService } from 'libs/modules';

@Auth()
@Controller('/admin/entity-field')
@ApiTags('entity fields')
@ControllerPermission(ENTITY_FIELD_READ_PERMISSION)
export class EntityFieldController {
  constructor(
    private readonly entityFieldBaseService: EntityFieldBaseService,
    private readonly browserGroupService: BrowserGroupService,
  ) {}

  @Get('/plant/:plantUuid')
  @RequiresPermission(ENTITY_FIELD_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant entities')
  async findPlantParameters(@Param() plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    return await this.entityFieldBaseService.findPlantParameters(plantUuid);
  }

  @Get('/entity-type/:etUuid')
  @RequiresPermission(ENTITY_FIELD_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read entity type parameters')
  async findEntityTypeParameters(
    @Param() entityTypeUuidDto: EntityTypeUuidDto,
  ) {
    const { etUuid } = entityTypeUuidDto;
    return await this.entityFieldBaseService.findEntityTypeParameters(etUuid);
  }

  @Get('/find/:uuid')
  @RequiresPermission(ENTITY_FIELD_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find one parameters')
  async findOne(@Param() uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return await this.entityFieldBaseService.findOne(uuid);
  }

  @Post()
  @RequiresPermission(ENTITY_FIELD_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create one parameter')
  async create(@Body() createEntityFieldDto: CreateEntityFieldDto) {
    return await this.entityFieldBaseService.add(createEntityFieldDto);
  }

  @Post('/many')
  @RequiresPermission(ENTITY_FIELD_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create many parameters')
  async createMany(
    @Body() createEntityFieldArrayDto: CreateMultipleEntityFieldDto,
  ) {
    return await this.entityFieldBaseService.addMany(createEntityFieldArrayDto);
  }

  @Patch()
  @RequiresPermission(ENTITY_FIELD_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one parameter')
  async update(@Body() updateEntityFieldDto: UpdateEntityFieldDto) {
    return await this.entityFieldBaseService.modify(updateEntityFieldDto);
  }

  @Patch('/many')
  @RequiresPermission(ENTITY_FIELD_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update many parameters')
  async updateMany(@Body() updateEntityFieldDto: UpdateMultipleEntityFieldDto) {
    return await this.entityFieldBaseService.modifyMany(updateEntityFieldDto);
  }

  @Delete('/one/:uuid')
  @RequiresPermission(ENTITY_FIELD_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete one parameter')
  async delete(@Param() uuidDto: UuidDto) {
    return await this.entityFieldBaseService.remove(uuidDto);
  }

  @Delete('/many')
  @RequiresPermission(ENTITY_FIELD_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete many parameters')
  async deleteMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.entityFieldBaseService.removeMany(multipleUuidDto);
  }

  @Get('/browser-group')
  @RequiresPermission(ENTITY_FIELD_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read parameter browser groups')
  async getBrowserGroups() {
    return await this.browserGroupService.fetchBrowserGroupOptions();
  }
}
