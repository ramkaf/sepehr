import { Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { AccessTypeEnum } from 'libs/enums';
import { User } from './user.entity';

@SchemaEntity('main', 'access_type')
export class AccessType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: AccessTypeEnum, type: 'enum', unique: true })
  access: AccessTypeEnum;

  @OneToMany(() => User, (user) => user.accessType)
  users: User[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  uuid: string;
}
