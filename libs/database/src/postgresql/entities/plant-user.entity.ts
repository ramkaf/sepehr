import {
  Column,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';
import { User } from './user.entity';
import { EntityModel } from './entity.entity';
import { Exclude } from 'class-transformer';

@SchemaEntity('main', 'user_entity_assignment')
@Index(['userId', 'entityId'], { unique: true }) // Ensures one assignment per user-entity pair
export class UserEntityAssignment {
  @Exclude()
  @PrimaryGeneratedColumn({ name: 'assignment_id' })
  assignmentId: number;

  @Column({ name: 'user_id', type: 'int' })
  @Index()
  userId: number;

  @Column({ name: 'entity_id', type: 'int' })
  @Index()
  entityId: number;

  @Column({
    name: 'assignment_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  assignmentDate: Date;

  @Column({
    name: 'assigned_by',
    type: 'int',
    default: null,
    nullable: true,
    comment: 'ID of the user who made this assignment',
  })
  assignedBy: number | null;

  @ManyToOne(() => User, (user) => user.entityAssignments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => EntityModel, (entity) => entity.userAssignments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityModel;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'assigned_by' })
  assignor: User | null;
}
