import {
  Controller,
  Body,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MultipleUuidDto, CreateMultipleChartEntityDto } from 'libs/dtos';

import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import {
  CHART_ENTITY_CREATE_PERMISSION,
  CHART_ENTITY_PERMISSION,
  CHART_ENTITY_REMOVE_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ChartEntityService } from 'libs/modules';

@Auth()
@Controller('/admin/chart-entities')
@ApiTags('chart entities')
@ControllerPermission(CHART_ENTITY_PERMISSION)
export class ChartEntityController {
  constructor(private readonly chartEntityService: ChartEntityService) {}

  @Post('/many')
  @RequiresPermission(CHART_ENTITY_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create multiple chart entities')
  async createMany(
    @Body() createMultipleChartEntityDto: CreateMultipleChartEntityDto,
  ) {
    return await this.chartEntityService.addMany(createMultipleChartEntityDto);
  }

  @Delete('/many')
  @RequiresPermission(CHART_ENTITY_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete multiple chart entities')
  async deleteMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.chartEntityService.removeMany(multipleUuidDto);
  }
}
