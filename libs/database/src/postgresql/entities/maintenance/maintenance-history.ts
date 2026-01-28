import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MaintenanceStep } from './maintenance-step.entity';
import { EntityModel } from '../entity.entity';
import { User } from '../user.entity';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'maintenance_history')
export class MaintenanceHistory {
  @PrimaryGeneratedColumn({ name: 'mh_id' })
  mh_id: number;

  @Column({ name: 'entity_id', type: 'int' })
  entity_id: number;

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
  previous_step_id?: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'previous_step_id' })
  previous_step?: MaintenanceStep;

  @Column({ name: 'new_step_id', type: 'int' })
  newStepId: number;

  @ManyToOne(() => MaintenanceStep, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'new_step_id' })
  new_step_id: MaintenanceStep;

  @Column({ name: 'acknowledged_by_id', type: 'int' })
  acknowledgedById: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'acknowledged_by_id' })
  acknowledged_By?: User;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
  })
  uuid: string;
}
