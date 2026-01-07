import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'libs/database';
import { UuidDto } from 'libs/dtos';
import { BaseService } from 'libs/modules';
import { In, Repository } from 'typeorm';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository, 'Permission');
  }
  async findByUuids(uuids: string[]): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: {
        uuid: In(uuids),
      },
    });
  }
  async findWithRoles(uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return this.permissionRepository.find({
      where: {
        uuid,
      },
      relations: ['Role'],
    });
  }
}
