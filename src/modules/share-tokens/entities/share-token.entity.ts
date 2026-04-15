import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  TokenStatusEnum,
  TokenTypeEnum,
} from '../../../common/enums/database.enums';
import { View } from '../../views/entities/view.entity';
import { User } from '../../users/entities/user.entity';

@Entity('share_tokens')
export class ShareToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'view_id', type: 'uuid' })
  viewId!: string;

  @ManyToOne(() => View, (view) => view.shareTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'view_id' })
  view!: View;

  @Column({ name: 'token_hash', type: 'text', unique: true })
  tokenHash!: string;

  @Column({
    name: 'token_preview',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  tokenPreview?: string | null;

  @Column({
    name: 'token_type',
    type: 'enum',
    enum: TokenTypeEnum,
    enumName: 'token_type_enum',
    default: TokenTypeEnum.PUBLIC_SHARE,
  })
  tokenType!: TokenTypeEnum;

  @Column({
    type: 'enum',
    enum: TokenStatusEnum,
    enumName: 'token_status_enum',
    default: TokenStatusEnum.ACTIVE,
  })
  status!: TokenStatusEnum;

  @Column({ name: 'invited_user_id', type: 'uuid', nullable: true })
  invitedUserId?: string | null;

  @ManyToOne(() => User, (user) => user.invitedShareTokens, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser?: User | null;

  @Column({
    name: 'recipient_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  recipientEmail?: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ name: 'max_uses', type: 'integer', nullable: true })
  maxUses?: number | null;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount!: number;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt?: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string | null;

  @ManyToOne(() => User, (user) => user.createdShareTokens, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User | null;

  @Column({
    name: 'metadata_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadataJson!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt?: Date | null;
}
