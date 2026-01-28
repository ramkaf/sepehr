import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityModel } from './entity.entity';
import { User } from './user.entity';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityField } from './entity-field.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'collections')
export class CollectionEntity {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'c_id' })
  id: number;

  @Column({ name: 'collection_name', type: 'varchar', nullable: true })
  collectionName: string;

  @ManyToOne(() => User, (user) => user.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date', name: 'created_at', nullable: true })
  createdAt: Date;

  @ManyToOne(() => EntityModel, (entity) => entity.collections, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({ name: 'plant_id', type: 'integer' })
  plantId: number;

  @ManyToMany(() => EntityField, (entityField) => entityField.collections, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'collection_params',
    joinColumn: {
      name: 'collection_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'field_id',
      referencedColumnName: 'efId',
    },
  })
  entityFields: EntityField[];
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
