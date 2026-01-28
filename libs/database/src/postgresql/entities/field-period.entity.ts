import { Column, PrimaryGeneratedColumn, JoinColumn, OneToOne } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityFieldPeriodFunctionEnum, RangeTypeEnum } from 'libs/enums';
import { EntityField } from './entity-field.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'fields_period')
export class EntityFieldsPeriod {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({
    name: 'function_name',
    type: 'enum',
    enum: EntityFieldPeriodFunctionEnum,
    default: EntityFieldPeriodFunctionEnum.Avg,
  })
  functionName: EntityFieldPeriodFunctionEnum;

  @OneToOne(() => EntityField, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  }) // به جای CASCADE از 'SET NULL' استفاده کردیم
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField;

  @Column({ name: 'ef_id', type: 'int' })
  efId: number;

  @Column({ name: 'range_value', type: 'integer' })
  rangeValue: number;

  @Column({
    name: 'range_type',
    type: 'enum',
    enum: RangeTypeEnum,
    default: RangeTypeEnum.Minute,
  })
  rangeType: RangeTypeEnum;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
