import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityModel } from '../entity.entity';
import { MaintenanceStep } from './maintenance-step.entity';
import { User } from '../user.entity';
import { MediaResource } from '../media-resource.entity';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'device_maintenance')
export class DeviceMaintenance {
  @PrimaryGeneratedColumn({ name: 'dm_id' })
  dm_id: number;

  @Column({
    name: 'entity_id',
    type: 'int',
    unique: true,
  })
  entity_id: number;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({
    name: 'current_step_id',
    type: 'int',
    nullable: true,
  })
  current_step_id?: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_step_id' })
  current_step?: MaintenanceStep;

  @Column({
    name: 'last_updated_by',
    type: 'int',
    nullable: true,
  })
  last_updated_by?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_updated_by' })
  last_updated?: User;

  @Column({
    name: 'media_id',
    type: 'int',
    nullable: true,
  })
  media_id?: number;

  @ManyToOne(() => MediaResource, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_id' })
  media?: MediaResource;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  uuid: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updated_at: Date;
}
