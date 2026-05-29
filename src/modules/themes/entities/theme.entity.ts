import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThemeScopeEnum } from '../../../common/enums/database.enums';
import { User } from '../../users/entities/user.entity';
import { View } from '../../views/entities/view.entity';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string | null;

  @ManyToOne(() => User, (user) => user.themes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'owner_id' })
  owner?: User | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'enum',
    enum: ThemeScopeEnum,
    enumName: 'theme_scope_enum',
    default: ThemeScopeEnum.SYSTEM,
  })
  scope!: ThemeScopeEnum;

  @Column({ name: 'config_json', type: 'jsonb', default: () => "'{}'::jsonb" })
  configJson!: Record<string, any>;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => View, (view) => view.theme)
  views!: View[];
}
