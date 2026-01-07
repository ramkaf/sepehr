import {
  Controller,
  Body,
  Post,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  UpdateChartDetailFieldDto,
  CreateChartDetailFieldDto,
  UuidDto,
  MultipleUuidDto,
  CreateMultipleChartDetailFieldDto,
} from 'libs/dtos';
import {
  CHART_DETAIL_FIELD_CREATE_PERMISSION,
  CHART_DETAIL_FIELD_PERMISSION,
  CHART_DETAIL_FIELD_REMOVE_PERMISSION,
  CHART_DETAIL_FIELD_UPDATE_PERMISSION,
} from '../../../rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from '../../../rbac/decorators/requires-permission.decorator';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { ChartDetailFieldService } from 'libs/modules';

@Auth()
@Controller('/admin/chart-detail-field')
@ApiTags('chart detail fields')
@ControllerPermission(CHART_DETAIL_FIELD_PERMISSION)
export class ChartDetailFieldController {
  constructor(
    private readonly chartDetailFieldService: ChartDetailFieldService,
  ) {}

  // @Get()
  // @RequiresPermission(CHART_DETAIL_FIELD_READ_PERMISSION)
  // @HttpCode(HttpStatus.OK)
  // @ApiCreateOperationWithDocs('read chart detail fields')
  // async find() {
  //   return await this.chartDetailFieldService.read();
  // }

  @Post('/one')
  @RequiresPermission(CHART_DETAIL_FIELD_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create chart detail fields')
  async createOne(@Body() createDetailFieldDto: CreateChartDetailFieldDto) {
    return await this.chartDetailFieldService.add(createDetailFieldDto);
  }

  @Post('/many')
  @RequiresPermission(CHART_DETAIL_FIELD_CREATE_PERMISSION)
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateOperationWithDocs('create multiple chart detail fields')
  async createMany(
    @Body()
    createMultipleChartDetailFieldDto: CreateMultipleChartDetailFieldDto,
  ) {
    return await this.chartDetailFieldService.addMany(
      createMultipleChartDetailFieldDto,
    );
  }

  @Patch('/one')
  @RequiresPermission(CHART_DETAIL_FIELD_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update chart detail fields')
  async updateOne(@Body() updateDetailFieldDto: UpdateChartDetailFieldDto) {
    return await this.chartDetailFieldService.modify(updateDetailFieldDto);
  }

  @Patch('/many')
  @RequiresPermission(CHART_DETAIL_FIELD_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update multiple chart detail fields')
  async updateMany(@Body() updateDetailFieldDto: UpdateChartDetailFieldDto) {
    return await this.chartDetailFieldService.modify(updateDetailFieldDto);
  }

  @Delete('/one/:uuid')
  @RequiresPermission(CHART_DETAIL_FIELD_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete chart detail fields')
  async deleteOne(@Param() uuidDto: UuidDto) {
    return await this.chartDetailFieldService.remove(uuidDto);
  }

  @Delete('/many')
  @RequiresPermission(CHART_DETAIL_FIELD_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete multiple chart detail fields')
  async deleteMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.chartDetailFieldService.removeMany(multipleUuidDto);
  }
}
