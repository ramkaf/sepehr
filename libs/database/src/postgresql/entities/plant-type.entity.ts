import { Column, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';
import { FleetManager } from './fleat-manager.entity';

@SchemaEntity('main', 'plant_types')
export class PlantType {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'pt_id' })
  ptId: number;

  @Column({
    name: 'plant_type_title',
    type: 'varchar',
    unique: true,
    nullable: true,
  })
  plantTypeTitle: string;

  @Column({ name: 'plant_type_name', type: 'varchar', nullable: true })
  plantTypeName: string;

  @OneToMany(() => FleetManager, (entity) => entity.plantType)
  fleetManagers: FleetManager[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
