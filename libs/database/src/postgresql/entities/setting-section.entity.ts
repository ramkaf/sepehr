import { PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Settings } from './setting.entity';

@SchemaEntity('main', 'setting_section')
export class SettingSection {
  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;

  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'title', type: 'varchar' })
  title: string;

  @Column({ name: 'description', type: 'varchar' })
  description: string;

  @OneToMany(() => Settings, (s) => s.id)
  section: Settings;
}
