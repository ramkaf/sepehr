import { Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Soiling } from './soiling.entity';
import { Exclude } from 'class-transformer';
import { EntityModel } from './entity.entity';

@SchemaEntity('main', 'soiling_entities')
export class SoilingEntities {
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
    name: 'e_id',
    type: 'integer',
    nullable: false,
  })
  entityId: number;

  @ManyToOne(() => EntityModel, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'e_id' })
  entity: EntityModel;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
