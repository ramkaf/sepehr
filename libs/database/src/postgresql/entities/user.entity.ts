import {
  Column,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityModel } from './entity.entity';
import { UserComponentsConfig } from './components.entity';
import { UserChart } from './user-chart.entity';
import { BookmarkField } from './bookmark-field.entity';
import { Soiling } from './soiling.entity';
import { CollectionEntity } from './collection.entity';
import { Role } from './role.entity';
import { Exclude, Expose } from 'class-transformer';
import { AccessType } from './access-type.entity';
import { OtpMethodEnum } from 'libs/enums';
import { UserEntityAssignment } from './plant-user.entity';

@SchemaEntity('main', 'users')
export class User {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'firstName', type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ name: 'lastName', type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  password?: string;

  @Exclude()
  @Column({ type: 'boolean', default: false })
  haveSmsAlert: boolean;

  @Exclude()
  @Column({ default: new Date(), type: 'timestamp' })
  lastLogin: Date;

  @Column({
    name: 'isActive',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'otp_method',
    type: 'enum',
    enum: OtpMethodEnum,
    default: OtpMethodEnum.PHONE,
  })
  otpMethod: OtpMethodEnum;

  @ManyToOne(() => Role, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToMany(() => EntityModel, (entity) => entity.users) // Points to 'users' property in EntityModel
  entities: EntityModel[];

  @OneToMany(() => UserComponentsConfig, (config) => config.user)
  userComponentsConfigs: UserComponentsConfig[];

  @OneToMany(() => UserChart, (userChart) => userChart.user)
  userCharts: UserChart[];

  @OneToMany(() => BookmarkField, (bookmark) => bookmark.user)
  bookmarkFields: BookmarkField[];

  @OneToMany(() => Soiling, (soiling) => soiling.user)
  soilingRecords: Soiling[];

  @OneToMany(() => CollectionEntity, (collection) => collection.user)
  collections: CollectionEntity[];

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ManyToOne(() => AccessType, {
    eager: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'access' })
  accessType: AccessType;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;

  @Column({
    name: 'two_factor_secret',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  twoFactorSecret: string | null;

  @Column({
    name: 'two_factor_enabled',
    type: 'boolean',
    default: false,
    nullable: true,
  })
  twoFactorEnabled: boolean;

  // add for old backend
  @Column({ type: 'varchar', length: 20, default: 'phone', name: 'otp_path' })
  otpPath: string;

  @Column({ type: 'varchar', length: 20, default: 'User', name: 'old_role' })
  oldRole: string;

  @OneToMany(() => UserEntityAssignment, (assignment) => assignment.user)
  entityAssignments: UserEntityAssignment[];
}
