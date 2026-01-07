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
  id: number;

  @Column({
    name: 'entity_id',
    type: 'int',
    unique: true,
  })
  entityId: number;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({
    name: 'current_step_id',
    type: 'int',
    nullable: true,
  })
  currentStepId?: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_step_id' })
  currentStep?: MaintenanceStep;

  @Column({
    name: 'last_updated_by',
    type: 'int',
    nullable: true,
  })
  lastUpdatedById?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_updated_by' })
  lastUpdatedBy?: User;

  @Column({
    name: 'media_id',
    type: 'int',
    nullable: true,
  })
  mediaId?: number;

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
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updatedAt: Date;
}
