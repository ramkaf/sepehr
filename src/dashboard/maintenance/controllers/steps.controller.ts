import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceStepService } from 'libs/modules';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  MAINTENANCE_STEP_PERMISSION,
  MAINTENANCE_STEP_READ_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';

@Auth()
@ApiTags('maintenance step')
// @ControllerPermission(MAINTENANCE_STEP_PERMISSION)
@Controller('maintenance')
export class MaintenanceStepsController {
  constructor(
    private readonly maintenanceStepService: MaintenanceStepService,
  ) {}

  @Get('/steps')
  // @RequiresPermission(MAINTENANCE_STEP_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find all maintenance steps')
  async find() {
    return await this.maintenanceStepService.find();
  }
}
