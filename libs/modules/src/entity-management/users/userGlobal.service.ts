import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessType, User } from 'libs/database';
import { Repository } from 'typeorm';
import { AccessTypeEnum } from 'libs/enums';
import { BaseService } from '../common/providers/base.service';
import { UpdateUserDto } from 'libs/dtos';
import { ERROR_MESSAGES } from 'libs/constants';

@Injectable()
export class UserGlobalService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AccessType)
    private readonly accessTypeRepository: Repository<AccessType>,
  ) {
    super(userRepository, 'User');
  }

  async modify(user: UpdateUserDto): Promise<boolean> {
    const { uuid, ...rest } = user;
    await this.update(uuid, rest);
    return true;
  }

  async find(): Promise<User | User[]> {
    return await this.findAll();
  }

  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
  async findAccessTypes() {
    return await this.accessTypeRepository.find();
  }
  async findAccessTypeid(access: AccessTypeEnum) {
    return await this.accessTypeRepository.findOne({
      where: {
        access,
      },
    });
  }

  async lastSeen(user: User) {
    user.lastLogin = new Date();
    return await this.save(user);
  }

  async findByCredentials(identifier: string): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('user.accessType', 'accessType')

      .where(
        'user.email = :identifier OR user.mobile = :identifier OR user.username = :identifier',
        {
          identifier,
        },
      )
      .select([
        'user', // Select the whole user object
        'role.id', // Select only the `id` field from the role
        'permission.id',
        'accessType.access',
      ])
      .getOne();
    return user;
  }

  async findWithRoleAndPermission() {
    return await this.userRepository.find({
      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }

  async findOneWithRoleAndPermission(uuid: string) {
    return await this.userRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }

  async fetchAdminUsers() {
    return await this.userRepository.find({
      where: {
        accessType: {
          access: AccessTypeEnum.ADMIN,
        },
      },
    });
  }
}
