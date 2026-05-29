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
import {
  AccessModeEnum,
  SelectionTypeEnum,
  ViewStatusEnum,
} from '../../../common/enums/database.enums';
import { User } from '../../users/entities/user.entity';
import { DataSource } from '../../data-sources/entities/data-source.entity';
import { SourceSheet } from '../../source-sheets/entities/source-sheet.entity';
import { SourceTable } from '../../source-tables/entities/source-table.entity';
import { Theme } from '../../themes/entities/theme.entity';
import { ViewPermission } from '../../view-permissions/entities/view-permission.entity';
import { ViewSnapshot } from '../../view-snapshots/entities/view-snapshot.entity';
import { SyncHistory } from '../../sync-histories/entities/sync-history.entity';
import { ShareToken } from '../../share-tokens/entities/share-token.entity';
import { CellChangeLog } from '../../cell-change-logs/entities/cell-change-log.entity';

@Entity('views')
export class View {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.ownedViews, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ name: 'data_source_id', type: 'uuid' })
  dataSourceId!: string;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.views, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'data_source_id' })
  dataSource!: DataSource;

  @Column({ name: 'source_sheet_id', type: 'uuid', nullable: true })
  sourceSheetId?: string | null;

  @ManyToOne(() => SourceSheet, (sourceSheet) => sourceSheet.views, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn([
    { name: 'source_sheet_id', referencedColumnName: 'id' },
    { name: 'data_source_id', referencedColumnName: 'dataSourceId' },
  ])
  sourceSheet?: SourceSheet | null;

  @Column({ name: 'source_table_id', type: 'uuid', nullable: true })
  sourceTableId?: string | null;

  @ManyToOne(() => SourceTable, (sourceTable) => sourceTable.views, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn([
    { name: 'source_table_id', referencedColumnName: 'id' },
    { name: 'data_source_id', referencedColumnName: 'dataSourceId' },
  ])
  sourceTable?: SourceTable | null;

  @Column({ name: 'theme_id', type: 'uuid', nullable: true })
  themeId?: string | null;

  @ManyToOne(() => Theme, (theme) => theme.views, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'theme_id' })
  theme?: Theme | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  slug!: string;

  @Column({
    name: 'access_mode',
    type: 'enum',
    enum: AccessModeEnum,
    enumName: 'access_mode_enum',
    default: AccessModeEnum.PRIVATE,
  })
  accessMode!: AccessModeEnum;

  @Column({
    type: 'enum',
    enum: ViewStatusEnum,
    enumName: 'view_status_enum',
    default: ViewStatusEnum.DRAFT,
  })
  status!: ViewStatusEnum;

  @Column({
    name: 'selection_type',
    type: 'enum',
    enum: SelectionTypeEnum,
    enumName: 'selection_type_enum',
    default: SelectionTypeEnum.FULL_SHEET,
  })
  selectionType!: SelectionTypeEnum;

  @Column({
    name: 'range_a1_notation',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rangeA1Notation?: string | null;

  @Column({ name: 'use_first_row_as_header', type: 'boolean', default: true })
  useFirstRowAsHeader!: boolean;

  @Column({ name: 'refresh_interval_seconds', type: 'integer', default: 60 })
  refreshIntervalSeconds!: number;

  @Column({ name: 'allow_theme_switch', type: 'boolean', default: false })
  allowThemeSwitch!: boolean;

  @Column({
    name: 'theme_override_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  themeOverrideJson!: Record<string, any>;

  @Column({
    name: 'settings_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  settingsJson!: Record<string, any>;

  @Column({ name: 'last_published_at', type: 'timestamptz', nullable: true })
  lastPublishedAt?: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ViewPermission, (permission) => permission.view)
  viewPermissions!: ViewPermission[];

  @OneToMany(() => ViewSnapshot, (snapshot) => snapshot.view)
  viewSnapshots!: ViewSnapshot[];

  @OneToMany(() => SyncHistory, (syncHistory) => syncHistory.view)
  syncHistories!: SyncHistory[];

  @OneToMany(() => ShareToken, (shareToken) => shareToken.view)
  shareTokens!: ShareToken[];

  @OneToMany(() => CellChangeLog, (cellChangeLog) => cellChangeLog.view)
  cellChangeLogs!: CellChangeLog[];
}
