import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionService } from './permission.service';
import { UserService } from '../../user/providers/user.service';
import { RedisService, Role } from 'libs/database';
import { BaseService } from 'libs/modules';
import { AssignPermissionsToRoleDto, CreateRoleDto, UuidDto } from 'libs/dtos';
import { ERROR_MESSAGES, REDIS_INDEX_ROLE } from 'libs/constants';

@Injectable()
export class RoleService extends BaseService<Role> {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private permissionService: PermissionService,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
  ) {
    super(roleRepository, 'Role');
  }

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.findByName(dto.name);
    if (existingRole)
      throw new BadRequestException(`Role name ${dto.name} Already Taken`);
    return await this.create(dto);
  }

  async assignPermissionsToRole(
    assignPermissionsToRoleDto: AssignPermissionsToRoleDto,
  ): Promise<Role> {
    const { roleUuid, permissionUuids } = assignPermissionsToRoleDto;
    const role = await this.roleRepository.findOne({
      where: {
        uuid: roleUuid,
      },
    });
    if (!role) throw new BadRequestException('role not found');
    const permissions =
      await this.permissionService.findByUuids(permissionUuids);
    role.permissions = permissions;

    const assignedRole = await this.roleRepository.save(role);
    await this.reIndexAllRoleAndPermissionsIntoRedis();
    return assignedRole;
  }

  async findAllWithPermissions(): Promise<Role[]> {
    return await this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .getMany();
  }

  async findOne(uuid: string): Promise<Role | null> {
    const role = await this.roleRepository.findOne({
      where: { uuid },
      relations: ['permissions'],
    });
    return role;
  }
  async findByName(name: string) {
    return await this.roleRepository.findOne({
      where: { name },
    });
  }

  async ensureRoleExist(uuid: string) {
    const role = await this.roleRepository.findOne({ where: { uuid } });
    if (!role) throw new NotFoundException(ERROR_MESSAGES.ROLE_NOT_FOUND(uuid));
    return role;
  }

  async findWithPermissions(uuidDto: UuidDto) {
    const { uuid } = uuidDto;
    return await this.roleRepository.findOne({
      where: {
        uuid,
      },
      relations: {
        permissions: true,
      },
    });
  }

  async reIndexAllRoleAndPermissionsIntoRedis() {
    const users = await this.findAllWithPermissions();
    await this.redisService.delete(REDIS_INDEX_ROLE);
    await this.redisService.set(REDIS_INDEX_ROLE, JSON.stringify(users));
  }
}
