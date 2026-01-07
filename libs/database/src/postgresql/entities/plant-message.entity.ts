import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityField } from './entity-field.entity';
import { AlarmCondition } from './alarm-condition';
import { PriorityLevelEnum } from 'libs/enums';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'plant_message')
@Unique(['psValue', 'psBitNo', 'entityField'])
export class PlantMessage {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'ps_id' })
  psId: number;

  @Column({ name: 'ps_text', type: 'text', nullable: true })
  psText: string | null;

  @Column({ name: 'ps_value', type: 'integer', nullable: true })
  psValue: number | null;

  @Column({ name: 'ps_bit_no', type: 'integer', nullable: true })
  psBitNo: number | null;

  @ManyToOne(() => EntityField, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField; // Relation with entity_fields table

  @Column({
    name: 'level',
    type: 'enum',
    enum: PriorityLevelEnum,
    nullable: true,
  })
  level: PriorityLevelEnum;

  @Column({ name: 'alarm_id', type: 'integer', nullable: true })
  alarmId: number | null;

  @ManyToOne(() => AlarmCondition, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'alarm_condition_id' })
  alarmCondition: AlarmCondition | null;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
