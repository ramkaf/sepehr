import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';
import { EntityModel } from './entity.entity';

@SchemaEntity('main', 'user_components_config')
export class UserComponentsConfig {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'ucc_id' })
  uccId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.userComponentsConfigs, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'component_tag', type: 'varchar', nullable: true })
  componentTag: string;

  @Column({ type: 'integer', nullable: true, default: null })
  x: number;

  @Column({ type: 'integer', nullable: true, default: null })
  y: number;

  @Column({ type: 'integer', nullable: true, default: null })
  rows: number;

  @Column({ type: 'integer', nullable: true, default: null })
  cols: number;

  @Column({ name: 'component_title', type: 'varchar', nullable: true })
  componentTitle: string;

  // @Column({ name: 'plant_id', type: 'integer', nullable: true })
  // plantId: number;

  @Column({ name: 'plant_id', type: 'integer' })
  plant_id: number;

  @ManyToOne(() => EntityModel, (entity) => entity.eId, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_id' })
  plant: EntityModel;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
