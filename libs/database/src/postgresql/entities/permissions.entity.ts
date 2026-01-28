import { PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'permissions_nest')
export class Permission {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @Column({ default: null, type: 'varchar' })
  category: string;

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()', // PostgreSQL function
  })
  uuid: string;
}
