import {
  CreateDeviceSpecDto,
  UpdateDeviceSpecDto,
} from '@app/dtos/maintenance';
import { EntityService } from '@app/modules/insight';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceSpec } from 'libs/database';
import { Repository } from 'typeorm';
import { EntityTypeBaseService } from '../../entity-types/providers/entity-type.base.service';
import { MaintenanceSpecService } from './maintenance-spec.service';
import { BaseService } from '../../common/providers/base.service';
import { ERROR_MESSAGES } from 'libs/constants';
import { DeviceSpecIdDto, EntityTypeIdDto } from 'libs/dtos';

@Injectable()
export class MaintenanceDeviceSpecService extends BaseService<DeviceSpec> {
  constructor(
    @InjectRepository(DeviceSpec)
    private readonly maintenanceDeviceSpecRepository: Repository<DeviceSpec>,
    private readonly specService: MaintenanceSpecService,
    @Inject(forwardRef(() => EntityService))
    private readonly entityService: EntityService,
    private readonly entityTypeService: EntityTypeBaseService,
  ) {
    super(maintenanceDeviceSpecRepository, 'maintenance device spec');
  }
  async add(
    entityTypeIdDto: EntityTypeIdDto,
    createDeviceSpecDto: CreateDeviceSpecDto,
  ) {
    const { entity_type_id } = entityTypeIdDto;
    const { spec_id } = createDeviceSpecDto;
    const entity_type = await this.entityTypeService.findOne(entity_type_id);
    if (!entity_type) throw new NotFoundException('entity type not found');
    const specs = await this.specService.findOne(spec_id);
    if (!specs) throw new NotFoundException(ERROR_MESSAGES.SPEC_NOT_FOUND);
    const specSchema = this.maintenanceDeviceSpecRepository.create({
      specs,
      entity_type,
    });
    const specification =
      await this.maintenanceDeviceSpecRepository.save(specSchema);
    return {
      entity_type_id,
      specification,
    };
  }
  async findDeviceSpecification(entityTypeUuid: string) {
    const entityType = await this.entityTypeService.findOne(entityTypeUuid);
    if (!entityType)
      throw new NotFoundException(
        ERROR_MESSAGES.ENTITY_TYPE_NOT_FOUND(entityTypeUuid),
      );
    const specs = await this.maintenanceDeviceSpecRepository.find({
      where: {
        entity_type: {
          uuid: entityTypeUuid,
        },
      },
      relations: {
        specs: true,
      },
      order: {
        specs: {
          spec_key: 'ASC',
        },
      },
    });
    return specs;
  }
  async findDeviceSpecificationByKey(entityUuid: string, spec_key: string) {
    const entity_type =
      await this.entityService.fetchEntityTypeOfEntity(entityUuid);
    if (!entity_type) throw new NotFoundException('entity uuid is invalid');
    return await this.maintenanceDeviceSpecRepository.findOne({
      where: {
        specs: {
          spec_key,
        },
        entity_type,
      },
    });
  }
  async modify(
    deviceSpecIdDto: DeviceSpecIdDto,
    updateDeviceSpecDto: UpdateDeviceSpecDto,
  ) {
    const { ds_id } = deviceSpecIdDto;
    const specDevice = await this.findOne(ds_id);
    if (!specDevice)
      throw new NotFoundException(ERROR_MESSAGES.DEVICE_SPEC_NOT_FOUND);
    Object.assign(specDevice, updateDeviceSpecDto);
    return await this.maintenanceDeviceSpecRepository.save(specDevice);
  }
  async remove(deviceSpecIdDto: DeviceSpecIdDto) {
    const { ds_id } = deviceSpecIdDto;
    const specDevice = await this.findOne(ds_id);
    if (!specDevice)
      throw new NotFoundException(ERROR_MESSAGES.DEVICE_SPEC_NOT_FOUND);
    return await this.maintenanceDeviceSpecRepository.remove(specDevice);
  }
}
