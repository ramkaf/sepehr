import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WarehouseDevice } from 'libs/database';
import { IsNull, Repository } from 'typeorm';
import { BaseService } from '../../common/providers/base.service';
import { CompanyWareHouseService } from '../../company-warehouse/providers/company-warehouse.service';
import { CompanyService } from '../../company/providers/company.service';
import {
  CreateWareHouseDeviceDto,
  UpdateWareHouseDeviceDto,
} from '@app/dtos/warehouse';
import { CompanyWarehouseIdDto } from 'libs/dtos';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class WarehouseDeviceService extends BaseService<WarehouseDevice> {
  constructor(
    @InjectRepository(WarehouseDevice)
    private readonly warehouseDeviceRepository: Repository<WarehouseDevice>,
    private readonly companyWarehouseService: CompanyWareHouseService,
    private readonly companyService: CompanyService,
  ) {
    super(warehouseDeviceRepository, 'Warehouse devices');
  }

  async fetchWarehouseDevices(
    userUuid: string,
    companyWarehouseIdDto: CompanyWarehouseIdDto,
    includeRemoved = false,
  ) {
    const { warehouse_id } = companyWarehouseIdDto;
    const warehouse =
      await this.companyWarehouseService.findWithCompany(warehouse_id);
    if (!warehouse)
      throw new NotFoundException(ERROR_MESSAGES.WAREHOUSE_NOT_FOUND);
    const check = await this.companyService.ensureCompanyAccess(
      userUuid,
      warehouse.company.uuid,
    );
    if (!check) throw new ForbiddenException('forbidden');
    const where = includeRemoved
      ? {
          warehouse,
          removed: IsNull(),
        }
      : {
          warehouse,
        };
    return await this.warehouseDeviceRepository.find({
      where,
      order: {
        created_at: 'desc',
      },
    });
  }
  async createWarehouseDevices(
    createWareHouseDevice: CreateWareHouseDeviceDto,
  ) {
    const { companyWarehouseUuid, ...rest } = createWareHouseDevice;
    const warehouse =
      await this.companyWarehouseService.findOne(companyWarehouseUuid);
    if (!warehouse) throw new BadRequestException('warehouse not found');
    const warehouseDeviceSchema = this.warehouseDeviceRepository.create({
      ...rest,
      warehouse,
    });
    return await this.warehouseDeviceRepository.save(warehouseDeviceSchema);
  }
  async updateWareHouseDevices(
    userUuid: string,
    warehouse_id: string,
    device_id: string,
    updateWareHouseDeviceDto: UpdateWareHouseDeviceDto,
  ) {
    const warehouseDevice = await this.wareHouseDeviceWithCompanyAccessChecking(
      userUuid,
      device_id,
    );
    Object.assign(warehouseDevice, updateWareHouseDeviceDto);
    return await this.warehouseDeviceRepository.save(warehouseDevice);
  }
  async removeWareHouseDevices(
    userUuid: string,
    warehouse_id: string,
    device_id: string,
  ): Promise<void> {
    const warehouseDevice = await this.wareHouseDeviceWithCompanyAccessChecking(
      userUuid,
      device_id,
    );
    const { company } = warehouseDevice.warehouse;
    const check = await this.companyService.ensureCompanyAccess(
      userUuid,
      company.uuid,
    );
    if (!check) throw new ForbiddenException('forbidden');
    await this.warehouseDeviceRepository.delete({
      uuid: device_id,
    });
  }
  private async wareHouseDeviceWithCompanyAccessChecking(
    userUuid: string,
    warehouseDeviceUuid: string,
  ) {
    const warehouseDevice = await this.warehouseDeviceRepository.findOne({
      where: {
        uuid: warehouseDeviceUuid,
      },
      relations: {
        warehouse: {
          company: true,
        },
      },
    });
    if (!warehouseDevice)
      throw new BadRequestException('warehouse device not fount');
    const { company } = warehouseDevice.warehouse;
    const check = await this.companyService.ensureCompanyAccess(
      userUuid,
      company.uuid,
    );
    if (!check) throw new ForbiddenException('forbidden');
    return warehouseDevice;
  }
}
