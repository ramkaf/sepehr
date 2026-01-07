import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyWarehouse } from './company-warehouse.entity';
import { SchemaEntity } from '../../decorators';

@SchemaEntity('maintenance', 'warehouse_devices')
export class WarehouseDevice {
  @PrimaryGeneratedColumn({ name: 'wd_id' })
  id: number;

  @Column({ name: 'warehouse_id', type: 'int', nullable: true })
  warehouseId?: number;

  @ManyToOne(() => CompanyWarehouse, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: CompanyWarehouse;

  @Column({
    name: 'serial_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  serialNumber?: string;

  @Column({
    name: 'product_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  productNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model?: string;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  displayName?: string;

  @Column({ type: 'timestamptz', nullable: true })
  removed?: Date;

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
