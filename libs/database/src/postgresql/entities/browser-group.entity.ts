import {
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityField } from './entity-field.entity';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { BrowserGroupEnum } from 'libs/enums';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'browser_group')
@Index(['efId', 'name'])
export class BrowserGroupEntity {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BrowserGroupEnum,
    default: BrowserGroupEnum.PARAMETERS,
  })
  name: BrowserGroupEnum;

  @Column({ name: 'ef_id', type: 'int' })
  efId: number;

  @ManyToOne(() => EntityField, (entityField) => entityField.browserGroup, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'ef_id' })
  entityField: EntityField;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
