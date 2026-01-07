import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MaintenanceStep } from './maintenance-step.entity';
import { EntityModel } from '../entity.entity';
import { User } from '../user.entity';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'maintenance_history')
export class MaintenanceHistory {
  @PrimaryGeneratedColumn({ name: 'mh_id' })
  id: number;

  @Column({ name: 'entity_id', type: 'int' })
  entityId: number;

  @ManyToOne(() => EntityModel, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({
    type: 'timestamptz',
    default: () => 'now()',
  })
  datetime: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'previous_step_id', type: 'int', nullable: true })
  previousStepId?: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'previous_step_id' })
  previousStep?: MaintenanceStep;

  @Column({ name: 'new_step_id', type: 'int' })
  newStepId: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'new_step_id' })
  newStep: MaintenanceStep;

  @Column({ name: 'acknowledged_by', type: 'int' })
  acknowledgedById: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedBy: User;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  uuid: string;
}
