import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EntityModel } from './entity.entity';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'alarm_config')
export class AlarmConfig {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'ac_id' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  tag: string;

  @Column({ name: 'plant_id', type: 'integer' })
  plantId: number;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: EntityModel;

  @OneToMany(() => AlarmConfig, (msg) => msg)
  entityFields: AlarmConfig[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
