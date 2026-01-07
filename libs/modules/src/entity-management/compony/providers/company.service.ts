import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { Company } from 'libs/database';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(
    @InjectRepository(Company)
    private readonly CompanyRepository: Repository<Company>,
  ) {
    super(CompanyRepository, 'Company');
  }
  async getCompanies(): Promise<Company[]> {
    return await this.CompanyRepository.find();
  }
}
