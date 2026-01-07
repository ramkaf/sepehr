import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { SettingSection } from './setting-section.entity';
import { Exclude } from 'class-transformer';

export enum SettingValueEnum {
  NUMBER = 'number',
  TEXT = 'string',
  BOOLEAN = 'boolean',
}

@SchemaEntity('main', 'setting')
export class Settings {
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;

  @Exclude()
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @Column({ name: 'valueType', type: 'enum', enum: SettingValueEnum })
  valueType: SettingValueEnum;

  @ManyToOne(() => SettingSection, (e) => e.id, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: SettingSection;
}
