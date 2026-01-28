import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { SchemaEntity } from '../../decorators';
import { EntityModel } from '../entity.entity';

@SchemaEntity('maintenance', 'device_warranties')
export class Warranty {
  @PrimaryGeneratedColumn({ name: 'w_id' })
  id: number;

  @Column({
    name: 'entity_id',
    type: 'int',
    unique: true,
  })
  entity_id: number;

  @OneToOne(() => EntityModel, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @Column({
    name: 'warranty_provider',
    type: 'varchar',
    length: 255,
  })
  warranty_provider: string;

  @Column({ type: 'text', default: null, nullable: true })
  description: string;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
  })
  start_date: Date;

  @Column({
    name: 'end_date',
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  end_date: Date | null;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  is_active: boolean;

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
