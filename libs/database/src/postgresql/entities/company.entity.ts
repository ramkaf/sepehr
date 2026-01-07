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
    default: () => 'uuid_generate_v4()',
  })
  uuid: string;

  @Exclude()
  @PrimaryGeneratedColumn({ name: 'company_id' })
  companyId: number;

  @Column({
    name: 'company_name',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  companyName: string;

  @Column({
    name: 'company_code',
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  companyCode: string;

  @Column({
    name: 'company_tag',
    type: 'varchar',
    length: 64,
    unique: true,
  })
  companyTag: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contactEmail?: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  contactPhone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

  @Column({ name: 'province_id', type: 'int', nullable: true })
  provinceId?: number;

  @ManyToOne(() => Province, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'province_id' })
  province?: Province;

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
