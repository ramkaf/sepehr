import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleService } from '../../rbac/services/role.service';
import { PasswordService } from './password.service';
import { RedisService, User, UserEntityAssignment } from 'libs/database';
import { UserGlobalService } from 'libs/modules';
import { CreateUserDto, UpdateUserDto, UuidDto } from 'libs/dtos';
import { AccessTypeEnum, OtpMethodEnum } from 'libs/enums';
import { ERROR_MESSAGES, REDIS_INDEX_USERS } from 'libs/constants';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => RoleService))
    private readonly roleService: RoleService,
    private readonly passwordService: PasswordService,
    @Inject(forwardRef(() => UserGlobalService))
    private readonly userGlobalService: UserGlobalService,
    private readonly redisService: RedisService,
    @InjectRepository(UserEntityAssignment)
    private readonly userEntityAssignmentRepository: Repository<UserEntityAssignment>,
  ) {}

  save(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }
  async create(createUserDto: CreateUserDto) {
    const { roleUuid, username, mobile, email, password } = createUserDto;
    const checkEmail = await this.userGlobalService.findByCredentials(email);
    if (checkEmail)
      throw new BadRequestException(`The email "${email}" is already in use.`);

    const checkMobile = await this.userGlobalService.findByCredentials(mobile);
    if (checkMobile)
      throw new BadRequestException(
        `The mobile number "${mobile}" is already in use.`,
      );

    const checkUsername =
      await this.userGlobalService.findByCredentials(username);
    if (checkUsername)
      throw new BadRequestException(
        `The username "${username}" is already taken.`,
      );

    const role = await this.roleService.findOne(roleUuid);
    if (!role)
      throw new NotFoundException(`Role with UUID "${roleUuid}" not found.`);

    const hash = await this.passwordService.hashPassword(password);
    const accessType = await this.userGlobalService.findAccessTypeid(
      AccessTypeEnum.USER,
    );
    if (!accessType) throw new BadRequestException('access type is null');
    const user = await this.userGlobalService.create({
      ...createUserDto,
      password: hash,
      role,
      accessType,
    });
    this.roleService.reIndexAllRoleAndPermissionsIntoRedis();
    return await this.userGlobalService.findOneWithRoleAndPermission(user.uuid);
  }

  async find(): Promise<User[]> {
    return await this.userGlobalService.findWithRoleAndPermission();
  }

  async update(updateUserDto: UpdateUserDto): Promise<User> {
    const { uuid } = updateUserDto;
    const user = await this.userGlobalService.findOne(uuid);
    if (!user) throw new BadRequestException('user is not found');
    Object.assign(user, updateUserDto);
    await this.roleService.reIndexAllRoleAndPermissionsIntoRedis();
    return this.userRepository.save(user);
  }

  async updatePassword(uuid: string, hash: string) {
    await this.userRepository.update(
      { uuid },
      {
        password: hash,
      },
    );
  }

  async lastSeen(user: User): Promise<User> {
    user.lastLogin = new Date();
    return await this.save(user);
  }

  async toggleActiveUser(uuidDto: UuidDto): Promise<boolean> {
    const { uuid } = uuidDto;
    const user = await this.userGlobalService.findOne(uuid);
    if (!user) throw new BadRequestException('user is not found');
    await this.userGlobalService.update(uuid, {
      isActive: user.isActive ? false : true,
    });
    return true;
  }

  async modifyOtpMethod(uuid: string, otpMethod: OtpMethodEnum) {
    const user = await this.userGlobalService.findOne(uuid);
    if (user)
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND(uuid));
    await this.userGlobalService.update(uuid, { otpMethod });
    return true;
  }

  async modifyAccessType(uuid: string, access: AccessTypeEnum) {
    const accessType = await this.userGlobalService.findAccessTypeid(access);
    if (!accessType) throw new BadRequestException('access Type is not found');
    await this.userGlobalService.update(uuid, { accessType });
    return true;
  }
  async findAllWithRoles(): Promise<User[]> {
    const cachedObj = await this.redisService.getObject(REDIS_INDEX_USERS);
    if (cachedObj) return cachedObj;
    return await this.reIndexUsersIntoRedis();
  }
  async userHasAccessToPlant(userUuid: string, plantUuid: string) {
    const entityAssignment = await this.userEntityAssignmentRepository.findOne({
      where: {
        user: {
          uuid: userUuid,
        },
        entity: {
          uuid: plantUuid,
        },
      },
    });
    if (!entityAssignment) return false;
    return true;
  }

  async userHasAccessToCompany(userUuid: string, plantUuid: string) {
    const entityAssignment = await this.userEntityAssignmentRepository.findOne({
      where: {
        user: {
          uuid: userUuid,
        },
        entity: {
          uuid: plantUuid,
        },
      },
    });
    if (!entityAssignment) return false;
    return true;
  }

  async reIndexUsersIntoRedis() {
    const usersWithRoles = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .getMany();
    await this.redisService.setObject(REDIS_INDEX_USERS, usersWithRoles);
    return usersWithRoles;
  }
}
