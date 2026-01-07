import { Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';
import { EntityType } from './entity-types.entity';

@SchemaEntity('main', 'Schematic_category')
export class SchematicCategory {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ nullable: true, default: null, type: 'varchar' })
  title: string | null;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;

  @OneToMany(() => EntityType, (entity) => entity.schematic)
  entityTypes: EntityType[];
}
