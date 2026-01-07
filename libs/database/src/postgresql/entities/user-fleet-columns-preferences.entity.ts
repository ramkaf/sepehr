import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FleetManagerColumns } from './fleet-manager-columns.entity';
import { User } from './user.entity';
import { SchemaEntity } from '../decorators';

@SchemaEntity('main', 'user_fleet_columns_preferences')
export class UserFleetColumnsPreferences {
  @PrimaryGeneratedColumn({
    name: 'ufc_id',
    type: 'int',
  })
  ufcId: number;

  @Column({
    name: 'user_id',
    type: 'int',
    nullable: false,
  })
  userId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'fmc_id',
    type: 'int',
    nullable: false,
  })
  fmcId: number;

  @ManyToOne(() => FleetManagerColumns, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'fmc_id' })
  fleetManagerColumn: FleetManagerColumns;

  @Column({
    name: 'is_visible',
    type: 'boolean',
    nullable: true,
    default: true,
  })
  isVisible: boolean;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: true,
  })
  displayOrder: number | null;

  @Column({
    name: 'uuid',
    type: 'uuid',
    nullable: false,
    unique: true,
    default: () => 'uuid_generate_v4()',
  })
  uuid: string;
}
