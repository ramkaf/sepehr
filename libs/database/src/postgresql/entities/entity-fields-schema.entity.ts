import { Column, PrimaryColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { MaskFunctionsEnum } from 'libs/enums';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'entity_field_schema')
export class EntityFieldSchema {
  @PrimaryColumn({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;

  @Column({ name: 'field_title', type: 'varchar' })
  fieldTitle: string;

  @Column({ name: 'field_tag', type: 'varchar' })
  fieldTag: string;

  @Exclude()
  @Column({
    name: 'unit',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  unit: string;

  @Exclude()
  @Column({ name: 'is_computational', type: 'boolean', default: false })
  isComputational: boolean;

  @Exclude()
  @Column({
    name: 'last_value_function_name',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  lastValueFunctionName: string | null;

  @Exclude()
  @Column({
    name: 'all_values_function_name',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  allValuesFunctionName: string | null;

  @Exclude()
  @Column({ name: 'is_static', type: 'boolean', default: false })
  isStatic: boolean;

  @Exclude()
  @Column({
    name: 'mask_function',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  maskFunction: MaskFunctionsEnum | null;

  @Column({ name: 'max_length', type: 'varchar', default: null })
  maxLength: string | null;

  @Column({ name: 'min_length', type: 'varchar', default: null })
  minLength: string | null;

  @Column({ name: 'is_enum', type: 'boolean', default: false })
  isEnum: boolean;

  @Column({ name: 'default_value', type: 'varchar', default: null })
  defaultValue: string | null;
}
