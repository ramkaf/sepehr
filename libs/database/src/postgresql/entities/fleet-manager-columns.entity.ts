import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { SchemaEntity } from '../decorators';

@SchemaEntity('main', 'fleet_manager_columns')
export class FleetManagerColumns {
  @PrimaryGeneratedColumn({
    name: 'fmc_id',
    type: 'int',
  })
  fmcId: number;

  @Column({
    name: 'column_tag',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
    comment: 'Unique identifier for the column (used in API responses)',
  })
  columnTag: string;

  @Column({
    name: 'column_title',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Display name shown in the UI',
  })
  columnTitle: string;

  @Column({
    name: 'column_type',
    type: 'varchar',
    length: 20,
    nullable: false,
    default: () => `'text'`,
    comment: 'Type of column: text, chart, icon, number',
  })
  columnType: string;

  @Column({
    name: 'default_visible',
    type: 'boolean',
    nullable: false,
    default: true,
    comment: 'Whether column is visible by default for new users',
  })
  defaultVisible: boolean;

  @Column({
    name: 'display_order',
    type: 'int',
    nullable: false,
    comment: 'Default order for column display',
  })
  displayOrder: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @Column({
    name: 'is_fixed',
    type: 'boolean',
    nullable: false,
    default: false,
    comment:
      'Whether column is fixed (always visible and not configurable by users) - currently all columns are configurable',
  })
  isFixed: boolean;

  @Column({
    name: 'uuid',
    type: 'uuid',
    nullable: false,
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  uuid: string;
}
