import {
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { AbstractionLevelEnum } from 'libs/enums';
import { EntityModel } from './entity.entity';
import { Soiling } from './soiling.entity';
import { ChartDetail } from './chart-detail.entity';
import { Exclude } from 'class-transformer';
import { EntityField } from './entity-field.entity';
import { EntityTypeFieldSetupStatus } from './entity-type-field-setup-status.entity.dto';
import { Schematic } from './schematic.entity';
import { SchematicCategory } from './schematic-category.entity';
import { DeviceTagMapping } from './maintenance';

@SchemaEntity('main', 'entity_types')
@Index(['tag', 'plantId'], { unique: true })
export class EntityType {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'et_id' })
  etId: number;

  @Column()
  name: string;

  @Column()
  tag: string;

  @Column({ name: 'track_timeout', type: 'boolean', default: true })
  trackTimout: boolean;

  @Column({ nullable: true, type: 'varchar', default: null })
  description: string | null;

  @Column({
    name: 'abstraction_level',
    type: 'enum',
    enum: AbstractionLevelEnum,
    nullable: true,
  })
  abstractionLevel: AbstractionLevelEnum;

  @Column({ name: 'plant_id', type: 'int', nullable: true })
  plantId?: number;

  // NEW: Relation to EntityModel where plant_id refers to eId
  @ManyToOne(() => EntityModel, (entity) => entity.entityTypes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'plant_id' })
  plant?: EntityModel;

  @Column({ name: 'schc_id', type: 'int', nullable: true, default: null })
  schematicId: number | null;

  // NEW: Relation to EntityModel where plant_id refers to eId
  @ManyToOne(() => SchematicCategory, (schc) => schc.entityTypes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'schc_id' })
  schematic: Schematic | null;

  @OneToOne(() => EntityTypeFieldSetupStatus, (fm) => fm.entityType, {
    cascade: true,
    nullable: true,
  })
  entityTypeFieldSetupStatus: EntityTypeFieldSetupStatus | null;

  @OneToMany(() => EntityModel, (entity) => entity.entityType)
  entities: EntityModel[];

  @OneToMany(() => EntityField, (entity) => entity.entityType)
  entityFields: EntityField[];

  @OneToMany(() => Soiling, (soiling) => soiling.entityType)
  soilings: Soiling[];

  @OneToMany(() => ChartDetail, (chartDetail) => chartDetail.entityType)
  chartDetails: ChartDetail[];

  @OneToMany(
    () => DeviceTagMapping,
    (deviceTagMapping) => deviceTagMapping.entity_type,
  )
  deviceTagMappings: DeviceTagMapping[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
