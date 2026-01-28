import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { Province } from 'libs/database';

@Injectable()
export class ProvinceService extends BaseService<Province> {
  constructor(
    @InjectRepository(Province)
    private readonly ProvinceRepository: Repository<Province>,
  ) {
    super(ProvinceRepository, 'Province');
  }
}
