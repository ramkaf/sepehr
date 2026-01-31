import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'primary_key_parameter')
export class PrimaryKeyParameter {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'table_name', type: 'varchar', length: 50, unique: true })
  table_name: string;

  @Column({ name: 'primary_key_field', type: 'varchar', length: 50 })
  primary_key_field: string;
}
