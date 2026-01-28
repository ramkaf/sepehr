import {
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { PlantSetupEnum } from 'libs/enums';
import { EntityModel } from './entity.entity';
import { Province } from './province.entity';
import { PlantType } from './plant-type.entity';
import { Company } from './company.entity';

@SchemaEntity('main', 'fleet_manager')
export class FleetManager {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'fm_id' })
  id: number;

  @Column({ name: 'service', type: 'varchar', nullable: true })
  service: string;

  @OneToOne(() => EntityModel, (plant) => plant.fleetManager, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_id' }) // This defines the FK column
  plant: EntityModel;

  @Column({
    name: 'setup-step',
    type: 'enum',
    enum: PlantSetupEnum,
    default: PlantSetupEnum.Completed,
  })
  setupStep: PlantSetupEnum;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;

  @Column({ name: 'plant_id', type: 'integer', nullable: true })
  plantId: number | null;

  @Column({ name: 'company_id', type: 'integer', nullable: true })
  companyId: number | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  setupStartedAt: Date;

  @ManyToOne(() => Province, (province) => province.fleetManagers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'p_id' })
  province: Province;

  @ManyToOne(() => PlantType, (plantType) => plantType.fleetManagers, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_type_id' })
  plantType: PlantType;

  @ManyToOne(() => Company, (company) => company.fleetManagers, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
