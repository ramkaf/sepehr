import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators';

@SchemaEntity('main', 'media_resources')
export class MediaResource {
  @PrimaryGeneratedColumn({ name: 'mr_id' })
  mr_id: number;

  @Column({
    name: 'media_tag',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  media_tag: string;

  @Column({
    name: 'media_type',
    type: 'varchar',
    length: 50,
  })
  media_type: string;

  @Column({
    name: 'storage_type',
    type: 'varchar',
    length: 50,
  })
  storage_type: string;

  @Column({ name: 'content_url', type: 'text', nullable: true })
  content_url?: string;

  @Column({ name: 'content_inline', type: 'text', nullable: true })
  content_inline?: string;

  @Column({
    name: 'content_identifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  content_identifier?: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

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
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
  })
  uuid: string;
}
