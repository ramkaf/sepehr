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
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateChartDto,
  PlantUuidDto,
  UpdateChartDto,
  UuidDto,
} from 'libs/dtos';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import {
  CHART_CREATE_PERMISSION,
  CHART_PERMISSION,
  CHART_READ_PERMISSION,
  CHART_REMOVE_PERMISSION,
  CHART_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import { ChartService } from 'libs/modules';

@Auth()
@Controller('/admin/charts')
@ApiTags('charts')
@ControllerPermission(CHART_PERMISSION)
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get()
  @RequiresPermission(CHART_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant charts')
  async findPlantCharts(@Query() plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    return await this.chartService.findPlantCharts(plantUuid);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiresPermission(CHART_CREATE_PERMISSION)
  @ApiCreateOperationWithDocs('create chart')
  async create(@Body() createChartDto: CreateChartDto) {
    return await this.chartService.add(createChartDto);
  }

  @Patch()
  @RequiresPermission(CHART_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update chart')
  async update(@Body() updateChartDto: UpdateChartDto) {
    return await this.chartService.modify(updateChartDto);
  }

  @Delete('/:uuid')
  @RequiresPermission(CHART_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete chart')
  async delete(@Param() uuidDto: UuidDto) {
    return await this.chartService.remove(uuidDto);
  }
}
