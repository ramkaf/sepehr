import {
  Controller,
  Body,
  Get,
  Delete,
  HttpStatus,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import {
  SOURCE_PERMISSION,
  SOURCE_READ_PERMISSION,
  SOURCE_REMOVE_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { SourceService } from 'libs/modules';
import {
  CreateUpdateMultipleSourceDto,
  PlantUuidDto,
  UuidDto,
} from 'libs/dtos';

@Auth()
@Controller('admin/init-plant/sources')
@ApiTags('sources')
@ControllerPermission(SOURCE_PERMISSION)
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get('/:plantUuid')
  @RequiresPermission(SOURCE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant sources')
  async readPlantSources(@Param() plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    return await this.sourceService.read(plantUuid);
  }

  @Post()
  @RequiresPermission(SOURCE_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('add or update source')
  async addOrUpdate(
    @Body() createUpdateMultipleSourceDto: CreateUpdateMultipleSourceDto,
  ) {
    return await this.sourceService.multipleAddOrUpdate(
      createUpdateMultipleSourceDto,
    );
  }

  @Delete('/:uuid')
  @RequiresPermission(SOURCE_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete a source')
  async removeSource(@Param() uuidDTO: UuidDto) {
    return await this.sourceService.remove(uuidDTO);
  }
}
