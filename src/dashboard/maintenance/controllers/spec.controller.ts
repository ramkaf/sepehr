import { CreateSpecEntryDto, UpdateSpecEntryDto } from '@app/dtos/maintenance';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SpecIdDto } from 'libs/dtos';
import { MaintenanceSpecService } from 'libs/modules';
import { ApiCreateOperationWithDocs, Auth } from 'src/document';

@Auth()
@ApiTags('spec')
// @ControllerPermission(SPEC_PERMISSION)
@Controller('maintenance/specs')
export class SpecController {
  constructor(
    private readonly maintenanceSpecService: MaintenanceSpecService,
  ) {}

  @Get('/:spec_id')
  // @RequiresPermission(SPEC_READ_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('find one specs')
  async get(@Param() specIdDto: SpecIdDto) {
    return await this.maintenanceSpecService.fetch(specIdDto);
  }

  @Post()
  // @RequiresPermission(SPEC_CREATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('create spec')
  async create(@Body() createSpecEntryDto: CreateSpecEntryDto) {
    return await this.maintenanceSpecService.add(createSpecEntryDto);
  }

  @Put('/:spec_id')
  // @RequiresPermission(SPEC_UPDATE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('update one spec')
  async update(
    @Param() specIdDto: SpecIdDto,
    @Body() updateSpecEntryDto: UpdateSpecEntryDto,
  ) {
    return await this.maintenanceSpecService.modify(
      specIdDto,
      updateSpecEntryDto,
    );
  }

  @Delete('/:spec_id')
  // @RequiresPermission(SPEC_REMOVE_PERMISSION)
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('delete one spec')
  async delete(@Param() specIdDto: SpecIdDto) {
    return await this.maintenanceSpecService.remove(specIdDto);
  }
}
