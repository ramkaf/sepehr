import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { SchemaEntity } from '../decorators/schema-entity.decorator';

@SchemaEntity('main', 'log')
export class ApiLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  userUuid: string | null;

  @Column({ type: 'varchar', length: 50 })
  method: string;

  @Index()
  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  params: object;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  queryParams: object;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  body: object;

  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" })
  responseData: object;

  @Column({ type: 'integer' })
  statusCode: number;

  @Column({ type: 'text', default: null })
  errorMessage: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'json', nullable: true })
  rawRequest?: object;

  @CreateDateColumn({ type: 'timestamp', name: 'req_date' })
  reqDate: Date;

  @Column({ type: 'numeric', name: 'response_time', nullable: true })
  responseTime?: number;
}
