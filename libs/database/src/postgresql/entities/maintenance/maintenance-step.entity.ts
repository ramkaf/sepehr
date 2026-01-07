import { PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'maintenance_steps')
export class MaintenanceStep {
  @PrimaryGeneratedColumn({ name: 'ms_id' })
  id: number;

  @Column({ name: 'step_name', type: 'varchar', length: 255, unique: true })
  stepName: string;

  @Column({ name: 'step_order', type: 'int', unique: true })
  stepOrder: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
}
