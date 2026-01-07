import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Soiling } from './soiling.entity';
import { Exclude } from 'class-transformer';
import { EntityModel } from './entity.entity';
import { EntityField } from './entity-field.entity';

@SchemaEntity('main', 'soiling_entity_fields')
export class SoilingEntityFields {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 's_id',
    type: 'integer',
    nullable: false,
  })
  soilingId: number;

  @ManyToOne(() => Soiling, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 's_id' })
  soiling: Soiling;

  @Column({
    name: 'ef_id',
    type: 'integer',
    nullable: false,
  })
  entityFieldId: number;

  @ManyToOne(() => EntityField, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityModel;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
