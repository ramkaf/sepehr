import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Chart } from './charts.entity';
import { EntityType } from './entity-types.entity';
import { DetailField } from './detail-field.entity';
import { ChartEntity } from './chart-entity.entity';
import { GroupTypeEnum } from 'libs/enums';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'chart_details')
export class ChartDetail {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'detail_id' })
  detailId: number;

  @Column({ name: 'detail_title', type: 'varchar', nullable: true })
  detailTitle: string | null;

  @Column({ name: 'detail_des', type: 'varchar', nullable: true })
  detailDes: string | null;

  @Column({
    name: 'group_type',
    type: 'enum',
    enum: GroupTypeEnum,
    default: GroupTypeEnum.PER_DEVICE,
  })
  groupType: GroupTypeEnum;

  @Column({ name: 'chart_id', type: 'int' })
  chartId: number;

  @Column({ name: 'entity_type_id', type: 'int', nullable: true })
  etId: number | null;

  @ManyToOne(() => Chart, (chart) => chart.chartDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chart_id' })
  chart: Chart;

  @ManyToOne(() => EntityType, (entityType) => entityType.chartDetails, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_type_id' })
  entityType: EntityType | null;

  @OneToMany(() => DetailField, (detailsField) => detailsField.chartDetail)
  detailsFields: DetailField[];

  @OneToMany(() => ChartEntity, (chartEntity) => chartEntity.chartDetail)
  chartEntities: ChartEntity[];
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
