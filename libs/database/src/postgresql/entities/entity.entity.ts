import {
  Column,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityType } from './entity-types.entity';
import { User } from './user.entity';
import { Chart } from './charts.entity';
import { Soiling } from './soiling.entity';
import { ChartEntity } from './chart-entity.entity';
import { FleetManager } from './fleat-manager.entity';
import { AlarmConfig } from './alarm-config.entity';
import { CollectionEntity } from './collection.entity';
import { DocumentEntity } from './document.entity';
import { Exclude } from 'class-transformer';
import { Source } from './sources.entity';
import { UserEntityAssignment } from './plant-user.entity';
import { Schematic } from './schematic.entity';
import { SoilingEntities } from './soiling-entities.entity';

@SchemaEntity('main', 'entity')
export class EntityModel {
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;

  @Exclude()
  @PrimaryGeneratedColumn({ name: 'e_id' })
  @Index({ unique: true })
  eId: number;

  @Column({ name: 'entity_name', type: 'varchar' })
  entityName: string;

  @Column({ name: 'entity_tag', type: 'varchar', unique: true })
  @Index({ unique: true })
  entityTag: string;

  @Column({
    name: 'parent_in_tree_id',
    type: 'int',
    nullable: true,
    default: null,
  })
  parentInTreeId: number | null;

  @Column({ name: 'entity_type_id', type: 'int', nullable: true })
  etId: number | null;

  @ManyToOne(() => EntityType, (entityType) => entityType.etId, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_type_id' })
  entityType: EntityType;

  @OneToMany(() => EntityType, (entityType) => entityType.plant, {
    onDelete: 'SET NULL',
  })
  entityTypes: EntityType[];

  @OneToMany(() => UserEntityAssignment, (assignment) => assignment.user)
  entityAssignments: UserEntityAssignment[];

  // In EntityModel.entity.ts - keep existing ManyToMany for backward compatibility
  @ManyToMany(() => User, (user) => user.entities, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_entity',
    joinColumn: {
      name: 'entity_id',
      referencedColumnName: 'eId',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  users: User[];

  @OneToMany(() => ChartEntity, (chartEntity) => chartEntity.entity)
  chartEntities: ChartEntity[];

  @OneToOne(() => FleetManager, (fm) => fm.plant, { cascade: true })
  fleetManager: FleetManager;

  @OneToMany(() => AlarmConfig, (alarmConfig) => alarmConfig.plant)
  alarmConfigs: AlarmConfig[];

  @OneToMany(() => CollectionEntity, (collection) => collection.entity)
  collections: CollectionEntity[];

  @OneToMany(() => Chart, (chart) => chart.plant)
  charts: Chart[];

  @OneToMany(() => Soiling, (soiling) => soiling.baseEntity)
  baseSoilings: Soiling[];

  @OneToMany(() => Soiling, (soiling) => soiling.plant)
  plantSoilings: Soiling[];

  @OneToMany(() => DocumentEntity, (document) => document.plant)
  documents: DocumentEntity[];

  @OneToMany(() => Source, (source) => source.plant)
  sources: Source[];

  @OneToMany(() => Schematic, (schematic) => schematic.plant)
  schematics: Schematic[];
  // Add the new relationship
  @OneToMany(() => UserEntityAssignment, (assignment) => assignment.entity)
  userAssignments: UserEntityAssignment[];

  @OneToMany(() => SoilingEntities, (se) => se.entity)
  soilingEntities: SoilingEntities[];
}
