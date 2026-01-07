import {
  Column,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { PlantMessage } from './plant-message.entity';
import { Exclude } from 'class-transformer';
import { EntityModel } from './entity.entity';

@SchemaEntity('main', 'alarm_condition')
export class AlarmCondition {
  @Exclude()
  @PrimaryColumn({ name: 'id', type: 'integer' })
  id: number;

  @Column({ name: 'service_name', type: 'varchar', nullable: true })
  serviceName: string | null;

  @Column({ name: 'plant_id', type: 'integer' })
  plant_id: number;

  @ManyToOne(() => EntityModel, (entity) => entity.eId, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_id' })
  plantId: EntityModel;

  @OneToMany(() => PlantMessage, (pm) => pm.alarmCondition)
  userCharts: PlantMessage[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
