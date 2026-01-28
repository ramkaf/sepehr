import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { PlantType } from 'libs/database';

@Injectable()
export class PlantTypeService extends BaseService<PlantType> {
  constructor(
    @InjectRepository(PlantType)
    private readonly PlantTypeRepository: Repository<PlantType>,
  ) {
    super(PlantTypeRepository, 'PlantType');
  }
}
