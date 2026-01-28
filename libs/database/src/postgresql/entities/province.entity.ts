import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';
import { FleetManager } from './fleat-manager.entity';

@SchemaEntity('main', 'provinces')
export class Province {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'p_id' })
  pId: number;

  @Column({ name: 'province_name', type: 'varchar', nullable: true })
  provinceName: string;

  @Column({ name: 'province_lat', type: 'double precision', nullable: true })
  provinceLat: number;

  @Column({ name: 'province_long', type: 'double precision', nullable: true })
  provinceLong: number;

  @OneToMany(() => FleetManager, (entity) => entity.province)
  fleetManagers: FleetManager[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
