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

@SchemaEntity('maintenance', 'spec')
export class Specs {
  @PrimaryGeneratedColumn({ name: 'spec_id' })
  spec_id: number;

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

  @Column({ name: 'media_id', type: 'int', nullable: true })
  media_id?: number;

  @ManyToOne(() => MediaResource, (md) => md.mr_id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'media_id' })
  media?: MediaResource;

  @OneToMany(() => DeviceSpec, (pm) => pm.specs)
  deviceSpecs: DeviceSpec[];
  @Column({
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
  })
  uuid: string;
}
