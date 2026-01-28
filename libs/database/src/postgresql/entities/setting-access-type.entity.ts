import { Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { AccessType } from './access-type.entity';
import { Settings } from './setting.entity';

@SchemaEntity('main', 'setting_access_type')
export class AccessTypeSetting {
  @PrimaryColumn({ name: 'access_type' })
  accessTypeId: number;

  @PrimaryColumn({ name: 'setting_id' })
  settingId: number;

  @ManyToOne(() => AccessType)
  @JoinColumn({ name: 'access_type' })
  accessType: AccessType;

  @ManyToOne(() => Settings, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'setting_id' })
  setting: Settings;

  @Column({
    name: 'settingValue',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  settingValue: string;
}
