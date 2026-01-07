import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';
import { EntityType } from '../entity-types.entity';

@SchemaEntity('maintenance', 'device_tag_mapping')
export class DeviceTagMapping {
  @PrimaryGeneratedColumn({ name: 'dtm_id' })
  id: number;

  @Column({
    name: 'entity_type_id',
    type: 'int',
    unique: true,
  })
  entityTypeId: number;

  @ManyToOne(() => EntityType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_type_id' })
  entityType: EntityType;

  @Column({ name: 'model_tag', type: 'varchar', length: 255, nullable: true })
  modelTag?: string;

  @Column({ name: 'sn_tag', type: 'varchar', length: 255, nullable: true })
  snTag?: string;

  @Column({ name: 'pn_tag', type: 'varchar', length: 255, nullable: true })
  pnTag?: string;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
  })
  uuid: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updatedAt: Date;

  @Column({
    name: 'mapping_title',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment:
      'Descriptive title for identifying the mapping (e.g., "qom inverters", "jarghoyeh smartLoggers")',
  })
  mappingTitle?: string;
}
