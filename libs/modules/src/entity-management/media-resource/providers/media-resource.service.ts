import { Injectable } from '@nestjs/common';
import {
  DeviceTagMapping,
  EntityType,
  MediaResource,
  Spec,
} from 'libs/database';
import { In, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MediaResourceService extends BaseService<MediaResource> {
  constructor(
    @InjectRepository(MediaResource)
    private readonly mediaResourceRepository: Repository<MediaResource>,
  ) {
    super(mediaResourceRepository, 'spec');
  }
}
