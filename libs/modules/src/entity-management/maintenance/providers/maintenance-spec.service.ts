import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSpecEntryDto, UpdateSpecEntryDto } from '@app/dtos/maintenance';
import { MediaResourceService } from '../../media-resource/providers/media-resource.service';
import { SpecIdDto } from 'libs/dtos';
import { ERROR_MESSAGES } from 'libs/constants';
import { Specs } from '@app/database/postgresql/entities/maintenance/specs.entity';

@Injectable()
export class MaintenanceSpecService extends BaseService<Specs> {
  constructor(
    @InjectRepository(Specs)
    private readonly specRepository: Repository<Specs>,
    private readonly mediaResourceService: MediaResourceService,
  ) {
    super(specRepository, 'spec');
  }
  async add(createSpecEntryDto: CreateSpecEntryDto) {
    const { media_id = null, ...specSchema } = createSpecEntryDto;
    if (media_id) {
      const media = await this.mediaResourceService.findOne(media_id);
      if (!media) throw new NotFoundException('media uuid is invalid');
      Object.assign(specSchema, media);
    }
    return await this.specRepository.save(specSchema);
  }
  async fetch(specIdDto: SpecIdDto) {
    const { spec_id } = specIdDto;
    return await this.findOne(spec_id);
  }
  async modify(specIdDto: SpecIdDto, updateSpecEntryDto: UpdateSpecEntryDto) {
    const { spec_id } = specIdDto;
    const { media_id = null, ...rest } = updateSpecEntryDto;
    const specObj = await this.findOne(spec_id);
    if (!specObj) throw new NotFoundException('spec uuid is invalid');
    Object.assign(specObj, rest);
    if (media_id) {
      const media = await this.mediaResourceService.findOne(media_id);
      if (!media) throw new NotFoundException('media uuid is invalid');
      Object.assign(specObj, media);
    }
    return await this.specRepository.save(specObj);
  }
  async remove(specIdDto: SpecIdDto) {
    const { spec_id } = specIdDto;
    const spec = await this.findOne(spec_id);
    if (!spec) throw new NotFoundException(ERROR_MESSAGES.SPEC_NOT_FOUND);
    return await this.specRepository.remove(spec);
  }
}
