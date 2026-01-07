import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { User } from './user.entity';
import { Chart } from './charts.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'user_charts')
export class UserChart {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'uch_id' })
  uchId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'chart_id' })
  chartId: number;

  @ManyToOne(() => User, (user) => user.userCharts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chart, (chart) => chart.userCharts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'chart_id' })
  chart: Chart;

  @Column({ type: 'integer', nullable: true })
  x: number | null;

  @Column({ type: 'integer', nullable: true })
  y: number | null;

  @Column({ type: 'integer', nullable: true })
  cols: number | null;

  @Column({ type: 'integer', nullable: true })
  rows: number | null;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
