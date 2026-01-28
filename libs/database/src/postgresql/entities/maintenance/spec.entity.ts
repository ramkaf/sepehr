import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';
import { DeviceSpec } from './device-spec.entity';
import { MediaResource } from '../media-resource.entity';

@SchemaEntity('maintenance', 'specs')
export class Spec {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({
    type: 'varchar',
    name: 'spec_key',
    length: 255,
    unique: true,
    nullable: true,
  })
  spec_key: string;

  @Column({
    type: 'varchar',
    name: 'spec_title',
    length: 255,
    unique: true,
    nullable: true,
  })
  spec_title: string;

  @Column({
    name: 'media_id',
    type: 'int',
    nullable: true,
    default: null,
  })
  media_id?: number;

  @ManyToOne(() => MediaResource, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'media_id' })
  media?: MediaResource;

  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
  })
  uuid: string;
}
