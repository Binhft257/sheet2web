import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatusEnum } from '../../../common/enums/database.enums';
import { UserRole } from '../../../common/enums/user-role.enum';
import { DataSource } from '../../data-sources/entities/data-source.entity';
import { Theme } from '../../themes/entities/theme.entity';
import { View } from '../../views/entities/view.entity';
import { ViewPermission } from '../../view-permissions/entities/view-permission.entity';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';
import { ShareToken } from '../../share-tokens/entities/share-token.entity';
import { CellChangeLog } from '../../cell-change-logs/entities/cell-change-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    enumName: 'user_status_enum',
    default: UserStatusEnum.ACTIVE,
  })
  status!: UserStatusEnum;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role_enum',
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  codeId!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  codeExpired!: Date | null;

  @OneToMany(() => DataSource, (dataSource) => dataSource.owner)
  ownedDataSources!: DataSource[];

  @OneToMany(() => Theme, (theme) => theme.owner)
  themes!: Theme[];

  @OneToMany(() => View, (view) => view.owner)
  ownedViews!: View[];

  @OneToMany(() => ViewPermission, (permission) => permission.user)
  viewPermissions!: ViewPermission[];

  @OneToMany(() => ViewPermission, (permission) => permission.grantedByUser)
  grantedViewPermissions!: ViewPermission[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.actorUser)
  auditLogs!: AuditLog[];

  @OneToMany(() => ShareToken, (shareToken) => shareToken.invitedUser)
  invitedShareTokens!: ShareToken[];

  @OneToMany(() => ShareToken, (shareToken) => shareToken.createdByUser)
  createdShareTokens!: ShareToken[];

  @OneToMany(
    () => CellChangeLog,
    (cellChangeLog) => cellChangeLog.changedByUser,
  )
  cellChangeLogs!: CellChangeLog[];
}
