import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityModel } from './entity.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'schematics')
export class Schematic {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ nullable: true, default: null, type: 'varchar' })
  title: string | null;

  @Column({ name: 'plant_id', type: 'int', nullable: true })
  plantId?: number;

  // NEW: Relation to EntityModel where plant_id refers to eId
  @ManyToOne(() => EntityModel, (entity) => entity.entityTypes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'plant_id' })
  plant?: EntityModel;

  @Column({ type: 'json' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'now()' })
  updated_at: Date;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
