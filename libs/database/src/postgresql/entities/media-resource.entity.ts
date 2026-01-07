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
  id: number;

  @Column({
    name: 'media_tag',
    type: 'varchar',
    length: 150,
    unique: true,
  })
  mediaTag: string;

  @Column({
    name: 'media_type',
    type: 'varchar',
    length: 50,
  })
  mediaType: string;

  @Column({
    name: 'storage_type',
    type: 'varchar',
    length: 50,
  })
  storageType: string;

  @Column({ name: 'content_url', type: 'text', nullable: true })
  contentUrl?: string;

  @Column({ name: 'content_inline', type: 'text', nullable: true })
  contentInline?: string;

  @Column({
    name: 'content_identifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contentIdentifier?: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

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
    type: 'uuid',
    default: () => 'gen_random_uuid()',
    unique: true,
  })
  uuid: string;
}
