import { FetchPlantUserDependencyDto } from '@app/dtos/chart-management';
import {
  InsertMultipleUserComponentConfigDto,
  InsertUserComponentConfigDto,
  UpdateUserComponentConfigDto,
} from '@app/dtos/components';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MultipleUuidDto, UuidDto } from 'libs/dtos';
import { UserComponentConfigService } from 'libs/modules';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';
import {
  USER_COMPONENT_CONFIG_CREATE_PERMISSION,
  USER_COMPONENT_CONFIG_PERMISSION,
  USER_COMPONENT_CONFIG_READ_PERMISSION,
  USER_COMPONENT_CONFIG_REMOVE_PERMISSION,
  USER_COMPONENT_CONFIG_UPDATE_PERMISSION,
} from 'src/rbac/constants';
import {
  ControllerPermission,
  RequiresPermission,
} from 'src/rbac/decorators/requires-permission.decorator';

@Auth()
@Controller('/admin/user-component-config')
@ApiTags('user-component-config')
@ControllerPermission(USER_COMPONENT_CONFIG_PERMISSION)
export class UserComponentConfigController {
  constructor(
    private readonly userComponentConfigService: UserComponentConfigService,
  ) {}

  @Post('/add/one')
  @RequiresPermission(USER_COMPONENT_CONFIG_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('insert one component')
  async add(
    @Body() insertUserComponentConfigDto: InsertUserComponentConfigDto,
  ) {
    return this.userComponentConfigService.add(insertUserComponentConfigDto);
  }

  @Post('/add/many')
  @RequiresPermission(USER_COMPONENT_CONFIG_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('insert multiple component')
  async addMany(
    @Body()
    insertMultipleUserComponentConfigDto: InsertMultipleUserComponentConfigDto,
  ) {
    return this.userComponentConfigService.addMany(
      insertMultipleUserComponentConfigDto,
    );
  }

  @Get()
  @RequiresPermission(USER_COMPONENT_CONFIG_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs(
    'read all components that belong to a user in one plant',
  )
  async fetch(
    @Body() fetchPlantUserDependencyDto: FetchPlantUserDependencyDto,
  ) {
    return this.userComponentConfigService.get(fetchPlantUserDependencyDto);
  }

  @Patch()
  @RequiresPermission(USER_COMPONENT_CONFIG_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one component')
  async modify(
    @Body() updateUserComponentConfigDto: UpdateUserComponentConfigDto,
  ) {
    return this.userComponentConfigService.update(updateUserComponentConfigDto);
  }

  @Delete('/remove/one')
  @RequiresPermission(USER_COMPONENT_CONFIG_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('remove one component')
  async remove(@Body() uuidDto: UuidDto) {
    return this.userComponentConfigService.remove(uuidDto);
  }

  @Delete('/remove/many')
  @RequiresPermission(USER_COMPONENT_CONFIG_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('remove multiple component')
  async removeMany(@Body() multipleUuidDto: MultipleUuidDto) {
    return this.userComponentConfigService.removeMany(multipleUuidDto);
  }
}
