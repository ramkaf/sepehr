import {
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';
import { EntityModel } from './entity.entity';

@SchemaEntity('main', 'sources')
@Unique(['plantId', 'key'])
export class Source {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'key', type: 'varchar' })
  key: string;

  @Column({ name: 'source_name', type: 'varchar' })
  sourceName: string;

  @Column({ name: 'plant_id', type: 'int' })
  plantId: number;

  @ManyToOne(() => EntityModel, (plant) => plant.sources, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_id', referencedColumnName: 'eId' })
  plant: EntityModel;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
