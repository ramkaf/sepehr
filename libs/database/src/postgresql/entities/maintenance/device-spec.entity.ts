import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MediaResource } from '../media-resource.entity';
import { SchemaEntity } from '../../decorators';
import { EntityModel } from '../entity.entity';

@SchemaEntity('maintenance', 'device_specs')
export class DeviceSpec {
  @PrimaryGeneratedColumn({ name: 'ds_id' })
  id: number;

  @Column({ name: 'entity_id', type: 'int' })
  entityId: number;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({ name: 'spec_key', type: 'varchar', length: 150 })
  specKey: string;

  @Column({ name: 'spec_value', type: 'text' })
  specValue: string;

  @Column({ name: 'media_id', type: 'int', nullable: true })
  mediaId?: number;

  @ManyToOne(() => MediaResource, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_id' })
  media?: MediaResource;

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
}
