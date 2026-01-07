import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';
import { EntityModel } from '../entity.entity';

@SchemaEntity('maintenance', 'device_warranties')
export class DeviceWarranty {
  @PrimaryGeneratedColumn({ name: 'w_id' })
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
    name: 'warranty_provider',
    type: 'varchar',
    length: 255,
  })
  warrantyProvider: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamptz',
    nullable: true,
  })
  endDate?: Date;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
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
