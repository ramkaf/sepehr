import {
  Column,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityType } from './entity-types.entity';
import { AlertConfigMessage } from './alert-config-message.entity';
import { BookmarkField } from './bookmark-field.entity';
import { EntityFieldCondition } from './field-condition.entity';
import { EntityFieldsPeriod } from './field-period.entity';
import { Soiling } from './soiling.entity';
import { DetailField } from './detail-field.entity';
import { CollectionEntity } from './collection.entity';
import { BrowserGroupEntity } from './browser-group.entity';
import { EntityFieldTypeEnum, MaskFunctionsEnum } from 'libs/enums';
import { AlarmConfig } from './alarm-config.entity';
import { PlantMessage } from './plant-message.entity';
import { Exclude } from 'class-transformer';
import { SoilingEntityFields } from './soiling-entity-fields.entity';

@SchemaEntity('main', 'entity_fields')
@Unique(['fieldTag', 'etId'])
export class EntityField {
  @PrimaryGeneratedColumn({ name: 'ef_id' })
  efId: number;

  @Column({ name: 'field_title', type: 'varchar', default: null })
  fieldTitle: string;

  @Column({ name: 'field_tag', type: 'varchar' })
  fieldTag: string;

  @Column({
    name: 'unit',
    type: 'varchar',
    default: null,
    nullable: true,
  })
  unit: string;

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

  @Column({ name: 'is_static', type: 'boolean', default: false })
  isStatic: boolean;

  @Exclude()
  @Column({ name: 'static_value', type: 'varchar', default: null })
  staticValue: string | null;

  @Exclude()
  @Column({ name: 'browser_group', type: 'varchar', default: 'Parameters' })
  browserGroupOld: string;

  @Column({
    name: 'description',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  description: string;

  @Exclude()
  @Column({
    name: 'mask_function',
    type: 'enum',
    enum: MaskFunctionsEnum,
    nullable: true,
    default: null,
  })
  maskFunction: MaskFunctionsEnum | null;

  @Column({
    name: 'field_type',
    type: 'enum',
    enum: EntityFieldTypeEnum,
    default: null,
  })
  fieldType: EntityFieldTypeEnum;

  @Exclude()
  @Column({
    name: 'default_cache_value',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  defaultCacheValue: string | null;

  @Column({ name: 'entity_type_id', type: 'int' })
  etId: number;

  @ManyToOne(() => AlarmConfig, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'ac_id' })
  alarmConfig: AlarmConfig;

  @Column({ name: 'ac_id', type: 'int', nullable: true, default: null })
  acId: number | null;

  @ManyToOne(() => EntityType, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'entity_type_id' })
  entityType: EntityType;

  @OneToOne(
    () => EntityFieldsPeriod,
    (fieldsPeriod) => fieldsPeriod.entityField,
    {
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  )
  fieldsPeriod: EntityFieldsPeriod;

  @OneToMany(() => AlertConfigMessage, (msg) => msg.entityField)
  alertConfigMessages: AlertConfigMessage[];

  @OneToMany(() => BookmarkField, (bookmark) => bookmark.entityField)
  bookmarkFields: BookmarkField[];

  @OneToMany(() => EntityFieldCondition, (cond) => cond.entityField)
  conditions: EntityFieldCondition[];

  @OneToMany(() => EntityFieldCondition, (cond) => cond.dependentField)
  dependentConditions: EntityFieldCondition[];

  @OneToMany(() => Soiling, (soiling) => soiling.baseStringVoltage)
  soilingBaseVoltages: Soiling[];

  @OneToMany(() => Soiling, (soiling) => soiling.baseStringCurrent)
  soilingBaseCurrents: Soiling[];

  // @ManyToMany(() => Soiling, (soiling) => soiling.entityFields)
  // soilingFields: Soiling[];

  @OneToMany(() => DetailField, (detailsField) => detailsField.chartDetail)
  detailsFields: DetailField[];

  @ManyToMany(() => CollectionEntity, (collection) => collection.entityFields)
  collections: CollectionEntity[];

  @OneToMany(() => BrowserGroupEntity, (bwe) => bwe.entityField, {
    eager: true,
  })
  browserGroup: BrowserGroupEntity[];

  @OneToMany(() => PlantMessage, (bwe) => bwe.entityField)
  plantmessages: PlantMessage[];

  @OneToMany(() => SoilingEntityFields, (se) => se.entityField)
  soilingEntityFields: SoilingEntityFields[];

  @Exclude()
  @Column({
    name: 'nest_last_value_function_name',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  nestLastValueFunctionName: string | null;

  @Exclude()
  @Column({
    name: 'nest_all_values_function_name',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  nestAllValuesFunctionName: string | null;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
