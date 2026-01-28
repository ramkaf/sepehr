import {
  BadRequestException,
  Body,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company, CompanyWarehouse, Province } from 'libs/database';
import { CompanyUuidDto } from 'libs/dtos';
import { DeepPartial, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import {
  CreateCompanyWareHouseDto,
  UpdateCompanyWareHouseDto,
} from '@app/dtos/warehouse';
import { CompanyService } from '../../company/providers/company.service';
import { forbidden } from 'joi';
import { ERROR_MESSAGES } from 'libs/constants';
import { ProvinceService } from '../../province/providers/province.service';

@Injectable()
export class CompanyWareHouseService extends BaseService<CompanyWarehouse> {
  constructor(
    @InjectRepository(CompanyWarehouse)
    private readonly companyWareHouseRepository: Repository<CompanyWarehouse>,
    private readonly companyService: CompanyService,
    private readonly provinceService: ProvinceService,
  ) {
    super(companyWareHouseRepository, 'company wareHouse');
  }
  async findWithCompany(warehouseUuid: string) {
    return await this.companyWareHouseRepository.findOne({
      where: {
        uuid: warehouseUuid,
      },
      relations: {
        company: true,
      },
    });
  }
  async createCompanyWarehouse(
    userUuid: string,
    createCompanyWareHouseDto: CreateCompanyWareHouseDto,
  ): Promise<CompanyWarehouse> {
    const { province_id, company_id, ...rest } = createCompanyWareHouseDto;
    const province = await this.provinceService.findOne(province_id);
    if (!province) throw new BadRequestException('province not fount');

    const company = await this.companyService.findOne(company_id);
    if (!company) throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    const checkAccess = await this.companyService.ensureCompanyAccess(
      userUuid,
      company_id,
    );
    if (!checkAccess) throw new ForbiddenException('forbidden');

    const check = await this.companyWareHouseRepository.findOne({
      where: {
        name: rest.name,
        company: {
          uuid: company_id,
        },
      },
    });
    if (check)
      throw new BadRequestException('name already taken for this company');
    const companyWareHouseSchema = this.companyWareHouseRepository.create({
      ...rest,
      province,
      company,
    });
    return await this.companyWareHouseRepository.save(companyWareHouseSchema);
  }
  async fetch(userUuid: string, companyUuid: string) {
    const company = await this.companyService.findOne(companyUuid);
    if (!company) throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    await this.companyService.ensureCompanyAccess(userUuid, companyUuid);
    return await this.companyWareHouseRepository.find({
      where: {
        company: {
          uuid: companyUuid,
        },
      },
    });
  }
  async updateCompanyWareHouse(
    userUuid: string,
    warehouseUuid: string,
    updateCompanyWareHouseDto: UpdateCompanyWareHouseDto,
  ) {
    const {
      province_id = null,
      company_id = null,
      ...rest
    } = updateCompanyWareHouseDto;
    const companyWareHouse = await this.companyWareHouseRepository.findOne({
      where: {
        uuid: warehouseUuid,
      },
      relations: ['province', 'company'],
    });
    if (!companyWareHouse)
      throw new BadRequestException('company ware house not found');
    const check = await this.companyService.ensureCompanyAccess(
      userUuid,
      companyWareHouse.company.uuid,
    );
    if (!check) throw new ForbiddenException('forbidden');
    let updatedProvince;
    let updatedCompany;
    if (province_id) {
      updatedProvince = await this.provinceService.findOne(province_id);
      if (!updatedProvince)
        throw new NotFoundException(ERROR_MESSAGES.PROVINCE_NOT_FOUND);
    }
    if (company_id) {
      updatedCompany = await this.companyService.findOne(company_id);
      if (!updatedCompany)
        throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }
    if (province_id)
      Object.assign(companyWareHouse, {
        ...companyWareHouse,
        rest,
        province: updatedProvince,
      });
    if (company_id)
      Object.assign(companyWareHouse, {
        ...companyWareHouse,
        rest,
        company: updatedCompany,
      });
    return await this.companyWareHouseRepository.save(companyWareHouse);
  }
  async remove(userUuid: string, companyWarehouseUuid: string) {
    const companyWarehouse = await this.companyWareHouseRepository.findOne({
      where: {
        uuid: companyWarehouseUuid,
      },
      relations: ['company'],
    });
    if (!companyWarehouse)
      throw new BadRequestException('company warehouse not found');
    const companyUuid = companyWarehouse.company.uuid;
    const check = await this.companyService.ensureCompanyAccess(
      userUuid,
      companyUuid,
    );
    if (!check) throw new ForbiddenException('forbidden');
    return await this.companyWareHouseRepository.delete({
      uuid: companyWarehouseUuid,
    });
  }
}
