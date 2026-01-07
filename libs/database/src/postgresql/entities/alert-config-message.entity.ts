import { Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityField } from './entity-field.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'alert_config_message')
export class AlertConfigMessage {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'ef_id' })
  efId: number;

  @ManyToOne(() => EntityField, (field) => field.alertConfigMessages, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField;

  @Column({ name: 'condition', type: 'varchar', nullable: true })
  condition: string | null;

  @Column({ name: 'value', type: 'double precision', nullable: true })
  value: number | null;

  @Column({ name: 'message', type: 'varchar', nullable: true })
  message: string | null;

  @Column({ name: 'severity', type: 'varchar', nullable: true })
  severity: string | null;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
