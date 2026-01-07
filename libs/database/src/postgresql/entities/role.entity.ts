import { PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permissions.entity';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'role')
export class Role {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  description?: string;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  permissions: Permission[];

  @Column({
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()', // PostgreSQL function
  })
  uuid: string;
}
