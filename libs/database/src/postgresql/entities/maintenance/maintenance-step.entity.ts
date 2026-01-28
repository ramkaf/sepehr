import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'maintenance_steps')
export class MaintenanceStep {
  @PrimaryGeneratedColumn({ name: 'ms_id' })
  id: number;

  @Column({ name: 'step_name', type: 'varchar', length: 255, unique: true })
  step_name: string;

  @Column({ name: 'step_order', type: 'int', unique: true })
  step_order: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

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
