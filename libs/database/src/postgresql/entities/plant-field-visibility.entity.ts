import { ManyToOne, PrimaryColumn, JoinColumn, Unique, Column } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityField } from './entity-field.entity';
import { EntityModel } from './entity.entity';

@SchemaEntity('main', 'plant-field-visibility')
@Unique(['plantId', 'efId']) // can remove this if not needed
export class PlantFieldVisibility {
  @PrimaryColumn({ name: 'ef_id' })
  efId: number;

  @PrimaryColumn({ name: 'plant_id' })
  plantId: number;

  @Column({ type: 'boolean', name: 'is_enabled', default: true })
  isEnabled: boolean;

  @ManyToOne(() => EntityField, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField;

  @ManyToOne(() => EntityModel, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'plant_id' })
  plant: EntityModel;
}
