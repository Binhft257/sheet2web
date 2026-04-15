import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PermissionTypeEnum } from '../../../common/enums/database.enums';
import { View } from '../../views/entities/view.entity';
import { User } from '../../users/entities/user.entity';

@Entity('view_permissions')
@Unique('uq_view_permissions_view_user', ['viewId', 'userId'])
export class ViewPermission {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'view_id', type: 'uuid' })
  viewId!: string;

  @ManyToOne(() => View, (view) => view.viewPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'view_id' })
  view!: View;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.viewPermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'permission_type',
    type: 'enum',
    enum: PermissionTypeEnum,
    enumName: 'permission_type_enum',
    default: PermissionTypeEnum.VIEW,
  })
  permissionType!: PermissionTypeEnum;

  @Column({ name: 'granted_by', type: 'uuid', nullable: true })
  grantedBy?: string | null;

  @ManyToOne(() => User, (user) => user.grantedViewPermissions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'granted_by' })
  grantedByUser?: User | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
