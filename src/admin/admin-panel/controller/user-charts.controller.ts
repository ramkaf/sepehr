import { FetchPlantUserDependencyDto } from '@app/dtos/chart-management/fetch-user-charts.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MultipleUuidDto } from 'libs/dtos';
import { ChartManagementService } from 'libs/modules';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  CHART_MANAGEMENT_PERMISSION,
  CHART_MANAGEMENT_READ_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';

@Auth()
@Controller('/admin/user-charts')
@ApiTags('chart-management')
@ControllerPermission(CHART_MANAGEMENT_PERMISSION)
@Controller('/admin/chart-management')
export class UserChartsController {
  constructor(
    private readonly ChartManagementService: ChartManagementService,
  ) {}

  @Get()
  @RequiresPermission(CHART_MANAGEMENT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant charts that belong to a user')
  async fetchCharts(
    @Query() fetchPlantUserDependencyDto: FetchPlantUserDependencyDto,
  ) {
    return await this.ChartManagementService.fetchUserCharts(
      fetchPlantUserDependencyDto,
    );
  }

  @Delete()
  @RequiresPermission(CHART_MANAGEMENT_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read plant charts that belong to a user')
  async deleteMultipleUserCharts(@Body() multipleUuidDto: MultipleUuidDto) {
    return await this.ChartManagementService.deleteMultipleUserCharts(
      multipleUuidDto,
    );
  }
}
