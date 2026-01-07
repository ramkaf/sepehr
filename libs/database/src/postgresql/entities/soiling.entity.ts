import {
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { User } from './user.entity';
import { EntityType } from './entity-types.entity';
import { EntityField } from './entity-field.entity';
import { EntityModel } from './entity.entity';
import { Exclude } from 'class-transformer';
import { SoilingEntityFields } from './soiling-entity-fields.entity';
import { SoilingEntities } from './soiling-entities.entity';

@SchemaEntity('main', 'soiling')
export class Soiling {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'base_entity' })
  baseEntity: EntityModel;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: EntityModel;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => EntityType, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'et_id' })
  entityType: EntityType;

  @ManyToOne(() => EntityField, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'base_string_voltage' })
  baseStringVoltage: EntityField;

  @ManyToOne(() => EntityField, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'base_string_current' })
  baseStringCurrent: EntityField;

  @OneToMany(() => SoilingEntityFields, (se) => se.soiling)
  soilingEntityFields: SoilingEntityFields[];

  @OneToMany(() => SoilingEntities, (se) => se.soiling)
  soilingEntities: SoilingEntities[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
