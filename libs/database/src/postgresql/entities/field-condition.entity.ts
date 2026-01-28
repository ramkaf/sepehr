import {
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityField } from './entity-field.entity';
import {
  EntityFieldPeriodFunctionEnum,
  EntityFieldConditionOperatorEnum,
} from 'libs/enums';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'entity_field_condition')
@Unique(['entityField', 'dependentField'])
export class EntityFieldCondition {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EntityField, (field) => field.conditions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField;

  @ManyToOne(() => EntityField, (field) => field.dependentConditions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id_depend' })
  dependentField: EntityField;

  @Column({ type: 'integer', default: 0 })
  value: number;

  @Column({
    type: 'enum',
    enum: EntityFieldConditionOperatorEnum,
    default: EntityFieldConditionOperatorEnum.GreaterThan,
  })
  condition: EntityFieldConditionOperatorEnum;

  @Column({
    name: 'efc_function',
    type: 'enum',
    enum: EntityFieldPeriodFunctionEnum,
    default: EntityFieldPeriodFunctionEnum.Avg, // Default to 'avg'
  })
  efcFunction: EntityFieldPeriodFunctionEnum;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
