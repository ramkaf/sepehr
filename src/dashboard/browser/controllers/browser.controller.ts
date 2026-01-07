import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateOperationWithDocs, Auth } from '../../../document';
import { BrowserService } from '../providers/browser.service';
import type { Request } from 'express';
import { EntityFieldUuidDto, EntityUuidDto, PlantUuidDto } from 'libs/dtos';

@Auth()
@Controller('/dashboard/browser')
@ApiTags('browser')
export class BrowserController {
  constructor(private readonly browserService: BrowserService) {}

  @Get('/entities/:plantUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read entities tree in browser')
  async fetchEntitiesTree(@Param() plantUuidDto: PlantUuidDto) {
    return this.browserService.fetchEntitiesTree(plantUuidDto);
  }

  @Get('/entity-fields/:eUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read entities tree in browser')
  async fetchEntityFields(
    @Req() requset: Request,
    @Param() entityUuidDto: EntityUuidDto,
  ) {
    return this.browserService.fetchEntityFields(requset, entityUuidDto);
  }

  @Get('/bookmark/toggle/:efUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read entities tree in browser')
  async bookmarkToggle(
    @Req() req: Request,
    @Param() entityFieldUuidDto: EntityFieldUuidDto,
  ) {
    return this.browserService.bookmarkToggle(req, entityFieldUuidDto);
  }

  @Get('/events/:eUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read events of entity')
  async getEvents(@Param() entityUuidDto: EntityUuidDto) {
    return this.browserService.fetchEntityEvents(entityUuidDto);
  }

  @Get('/states/:eUuid')
  @HttpCode(HttpStatus.OK)
  @ApiCreateOperationWithDocs('read state of entity')
  async getStates(@Param() entityUuidDto: EntityUuidDto) {
    return this.browserService.fetchEntityStates(entityUuidDto);
  }
}
