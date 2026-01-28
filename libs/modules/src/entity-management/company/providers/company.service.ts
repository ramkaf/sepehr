import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { Company, FleetManager, Province, User } from 'libs/database';
import { UserService } from 'src/user/providers/user.service';
import { CompanyIdDto, CreateCompanyDto, UpdateCompanyDto } from 'libs/dtos';
import { ProvinceService } from '../../province/providers/province.service';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(FleetManager)
    private readonly fleetManagerRepository: Repository<FleetManager>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly provinceService: ProvinceService,
  ) {
    super(companyRepository, 'Company');
  }

  async add(createCompanyDto: CreateCompanyDto) {
    const {
      company_tag,
      company_name,
      province_id = null,
      ...rest
    } = createCompanyDto;
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .where(
        'company.company_name = :company_name OR company.company_tag = :company_tag',
        {
          company_name,
          company_tag,
        },
      )
      .getOne();
    if (company)
      throw new BadRequestException(
        `company name : ${company_name} or company tag : ${company_tag} already taken`,
      );
    let province: Province | null = null;
    if (province_id) {
      province = await this.provinceService.findOne(province_id);
    }

    return await this.companyRepository.save(
      this.companyRepository.create({
        ...rest,
        province,
        company_name,
        company_tag,
      }),
    );
  }

  async modify(companyIdDto: CompanyIdDto, updateCompanyDto: UpdateCompanyDto) {
    const { company_id } = companyIdDto;
    const { province_id = null } = updateCompanyDto;
    const company = await this.companyRepository.findOne({
      where: {
        uuid: company_id,
      },
    });
    if (!company) throw new NotFoundException(ERROR_MESSAGES.COMPANY_NOT_FOUND);
    Object.assign(company, updateCompanyDto);
    if (province_id) {
      const province = await this.provinceService.findOne(province_id);
      if (!province)
        throw new NotFoundException(ERROR_MESSAGES.PROVINCE_NOT_FOUND);
      Object.assign(company, province);
    }
    await this.companyRepository.save(company);
  }

  async getCompanies(): Promise<Company[]> {
    return await this.companyRepository.find();
  }

  async ensurePlantAccess(userUuid: string, plantUuid: string) {
    const hasAccess = await this.userService.userHasAccessToPlant(
      userUuid,
      plantUuid,
    );
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this plant');
    }
  }

  async ensureCompanyAccess(userUuid: string, companyUuid: string) {
    const query = `
        SELECT EXISTS(
          SELECT 1
          FROM main.fleet_manager fm
          JOIN main.user_entity_assignment uea ON fm.plant_id = uea.entity_id
          JOIN main.users u ON uea.user_id = u.id
          JOIN main.company c ON fm.company_id = c.company_id
          WHERE u.uuid = $1 AND c.uuid = $2
        ) AS has_access
      `;
    const access = this.dataSource.manager.query(query, [
      userUuid,
      companyUuid,
    ]);
    if (!access) {
      return false;
    }
    return true;
  }

  async userCompanies(userUuid: string, includePlants = false) {
    const companies = await this.companyRepository.find({
      where: {
        fleetManagers: {
          plant: {
            userAssignments: {
              user: {
                uuid: userUuid,
              },
            },
          },
        },
      },
      order: {
        createdAt: 'desc',
      },
    });

    if (!includePlants) {
      return companies;
    }
    const result: any = [];
    for (const company of companies) {
      const plants = await this.getCompanyPlants(company.uuid, userUuid);
      result.push({
        ...company,
        plants,
      });
    }

    return result;
  }

  async assignPlantToCompany(
    userUuid: string,
    company_id: string,
    plant_id: string,
  ) {
    await this.ensurePlantAccess(userUuid, plant_id);
    const company = await this.companyRepository.findOne({
      where: {
        uuid: company_id,
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    const fleet = await this.fleetManagerRepository.findOne({
      where: {
        plant: {
          uuid: company_id,
        },
      },
      relations: ['company'],
    });
    if (!fleet) throw new BadRequestException('plants not found');
    if (fleet.company)
      throw new BadRequestException(
        'Plant is already assigned to another company',
      );

    Object.assign(fleet, company);
    await this.fleetManagerRepository.save(fleet);
    return true;
  }

  async removePlantFromCompany(
    userUuid: string,
    companyUuid: string,
    plantUuid: string,
  ) {
    const check = await this.ensureCompanyAccess(userUuid, companyUuid);
    if (!check) throw new ForbiddenException('forbidden');

    const fleetManager = await this.fleetManagerRepository.findOne({
      where: {
        company: {
          uuid: companyUuid,
        },
        plant: {
          uuid: companyUuid,
        },
      },
    });
    if (!fleetManager)
      throw new BadRequestException('plant isn not assigned to company');
    await this.fleetManagerRepository.update(
      {
        plant: {
          uuid: plantUuid,
        },
      },
      {
        companyId: null,
      },
    );
    return { message: 'Plant removed from company successfully' };
  }

  async getCompanyPlants(userUuid: string, companyUuid: string) {
    const check = await this.ensureCompanyAccess(userUuid, companyUuid);
    if (!check) throw new ForbiddenException('forbidden');
    const result = await this.fleetManagerRepository.find({
      where: {
        company: {
          uuid: companyUuid,
        },
        plant: {
          userAssignments: {
            user: {
              uuid: userUuid,
            },
          },
        },
      },
      relations: {
        plant: true,
      },
    });
    return result.map((item) => {
      return {
        plant_name: item.plant.entityName,
        plant_tag: item.plant.entityTag,
        company_id: item.company.uuid,
        fm_id: item.uuid,
        plant_id: item.plantId,
      };
    });
  }
  async fetchUserCompany(userUuid: string) {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userUuid,
      },
      relations: {
        entityAssignments: {
          entity: {
            fleetManager: {
              company: true,
            },
          },
        },
      },
    });
    if (!user)
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND(userUuid));
    return user.entityAssignments.map((item) => item.entity);
  }
}
