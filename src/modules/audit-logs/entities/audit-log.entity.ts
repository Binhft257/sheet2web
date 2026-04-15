import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId?: string | null;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'actor_user_id' })
  actorUser?: User | null;

  @Column({ name: 'action_type', type: 'varchar', length: 100 })
  actionType!: string;

  @Column({ name: 'target_type', type: 'varchar', length: 100 })
  targetType!: string;

  @Column({ name: 'target_id', type: 'uuid', nullable: true })
  targetId?: string | null;

  @Column({ name: 'payload_json', type: 'jsonb', default: () => "'{}'::jsonb" })
  payloadJson!: Record<string, any>;

  @Column({ name: 'request_id', type: 'varchar', length: 100, nullable: true })
  requestId?: string | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
