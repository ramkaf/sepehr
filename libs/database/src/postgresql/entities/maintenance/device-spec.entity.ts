import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';
import { Specs } from './specs.entity';
import { EntityType } from '../entity-types.entity';

@SchemaEntity('maintenance', 'device_specs')
export class DeviceSpec {
  @PrimaryGeneratedColumn({ name: 'ds_id' })
  ds_id: number;

  @Column({ name: 'entity_type_id', type: 'int' })
  entity_type_id: number;

  @ManyToOne(() => EntityType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_type_id' })
  entity_type: EntityType;

  @Column({ name: 'spec_id', type: 'int' })
  spec_id: number;

  @ManyToOne(() => Specs, (s) => s.spec_id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'spec_id' })
  specs: Specs;

  @Column({ name: 'spec_value', type: 'varchar', length: 255, nullable: true })
  spec_value?: string;

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
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updated_at: Date;
}
