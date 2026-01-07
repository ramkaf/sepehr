import { Column, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { EntityType } from './entity-types.entity';

@SchemaEntity('main', 'entity-type-field-setup-status')
export class EntityTypeFieldSetupStatus {
  @PrimaryColumn({ name: 'et_id', unique: true })
  etId: number;

  @Column({ type: 'varchar', default: false, name: 'is_field_initiate' })
  isFieldsInitiated: boolean;

  @OneToOne(() => EntityType, { onDelete: 'CASCADE' }) // به جای CASCADE از 'SET NULL' استفاده کردیم
  @JoinColumn({ name: 'et_id' })
  entityType: EntityType;
}
