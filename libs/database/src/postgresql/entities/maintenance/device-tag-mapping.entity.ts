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
  dtm_id: number;

  @Column({
    name: 'entity_type_id',
    type: 'int',
    unique: true,
  })
  entity_type_id: number;

  @ManyToOne(() => EntityType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_type_id' })
  entity_type: EntityType;

  @Column({ name: 'model_tag', type: 'varchar', length: 255, nullable: true })
  model_tag?: string;

  @Column({ name: 'sn_tag', type: 'varchar', length: 255, nullable: true })
  sn_tag?: string;

  @Column({ name: 'pn_tag', type: 'varchar', length: 255, nullable: true })
  pn_tag?: string;

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
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'now()',
  })
  updated_at: Date;

  @Column({
    name: 'mapping_title',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment:
      'Descriptive title for identifying the mapping (e.g., "qom inverters", "jarghoyeh smartLoggers")',
  })
  mapping_title?: string;
}
