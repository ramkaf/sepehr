import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  UpdateChartDetailDto,
  CreateChartDetailDto,
  ChartUuidDto,
  UuidDto,
} from 'libs/dtos';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import {
  CHART_DETAIL_CREATE_PERMISSION,
  CHART_DETAIL_PERMISSION,
  CHART_DETAIL_READ_PERMISSION,
  CHART_DETAIL_REMOVE_PERMISSION,
  CHART_DETAIL_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ChartDetailService } from 'libs/modules';

@Auth()
@Controller('/admin/chart-details')
@ApiTags('chart details')
@ControllerPermission(CHART_DETAIL_PERMISSION)
export class ChartDetailController {
  constructor(private readonly chartDetailsService: ChartDetailService) {}

  @Get('/:chUuid')
  @RequiresPermission(CHART_DETAIL_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read chart detail')
  async getChartDetails(@Param() chartUuidDto: ChartUuidDto) {
    return await this.chartDetailsService.getChartDetails(chartUuidDto);
  }

  @Post()
  @RequiresPermission(CHART_DETAIL_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create chart detail')
  async create(@Body() createChartDetailDto: CreateChartDetailDto) {
    return await this.chartDetailsService.add(createChartDetailDto);
  }

  @Patch()
  @RequiresPermission(CHART_DETAIL_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update chart detail')
  async update(@Body() updateChartDetailDto: UpdateChartDetailDto) {
    return await this.chartDetailsService.modify(updateChartDetailDto);
  }

  @Delete('/:uuid')
  @RequiresPermission(CHART_DETAIL_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete chart detail')
  async remove(@Param() uuidDto: UuidDto) {
    return await this.chartDetailsService.remove(uuidDto);
  }
}
