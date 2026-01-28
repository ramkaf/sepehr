import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';
import { Province } from './province.entity';
import { FleetManager } from './fleat-manager.entity';

@SchemaEntity('main', 'company')
export class Company {
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  uuid: string;

  @Exclude()
  @PrimaryGeneratedColumn({ name: 'company_id' })
  company_id: number;

  @Column({
    name: 'company_name',
    type: 'varchar',
    unique: true,
  })
  company_name: string;

  @Column({
    name: 'company_code',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  company_code: string;

  @Column({
    name: 'company_tag',
    type: 'varchar',
    length: 64,
    unique: true,
  })
  company_tag: string;

  @Column({ type: 'text', nullable: true, default: null })
  description: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  contact_email: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 64,
    nullable: true,
    default: null,
  })
  contact_phone: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 255, default: null, nullable: true })
  country: string;

  @Column({ name: 'province_id', type: 'int', default: null, nullable: true })
  province_id: number | null;

  @ManyToOne(() => Province, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'province_id' })
  province: Province | null;

  @OneToMany(() => FleetManager, (entity) => entity.province)
  fleetManagers: FleetManager[];

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
