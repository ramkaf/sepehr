import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Province } from '../province.entity';
import { SchemaEntity } from '../../decorators';
import { Company } from '../company.entity';

@SchemaEntity('maintenance', 'company_warehouses')
export class CompanyWarehouse {
  @PrimaryGeneratedColumn({ name: 'warehouse_id' })
  warehouseId: number;

  @Column({ name: 'company_id', type: 'int', nullable: true })
  companyId?: number;

  @ManyToOne(() => Company, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'province_id', type: 'int', nullable: true })
  provinceId?: number;

  @ManyToOne(() => Province, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'province_id' })
  province?: Province;

  @Column({ type: 'varchar', length: 255, nullable: true })
  country?: string;

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
