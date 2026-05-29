import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import {
  SelectionTypeEnum,
  SyncStatusEnum,
} from '../../../common/enums/database.enums';
import { View } from '../../views/entities/view.entity';
import { SyncHistory } from '../../sync-histories/entities/sync-history.entity';

@Entity('view_snapshots')
@Unique('uq_view_snapshots_view_version', ['viewId', 'versionNo'])
export class ViewSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'view_id', type: 'uuid' })
  viewId!: string;

  @ManyToOne(() => View, (view) => view.viewSnapshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'view_id' })
  view!: View;

  @Column({ name: 'version_no', type: 'bigint' })
  versionNo!: string;

  @Column({ name: 'is_current', type: 'boolean', default: true })
  isCurrent!: boolean;

  @Column({
    name: 'resolved_selection_type',
    type: 'enum',
    enum: SelectionTypeEnum,
    enumName: 'selection_type_enum',
  })
  resolvedSelectionType!: SelectionTypeEnum;

  @Column({
    name: 'resolved_sheet_name_snapshot',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resolvedSheetNameSnapshot?: string | null;

  @Column({
    name: 'resolved_table_name_snapshot',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resolvedTableNameSnapshot?: string | null;

  @Column({
    name: 'resolved_range_a1',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  resolvedRangeA1?: string | null;

  @Column({
    name: 'resolved_meta_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  resolvedMetaJson!: Record<string, any>;

  @Column({ name: 'headers_json', type: 'jsonb', default: () => "'[]'::jsonb" })
  headersJson!: any[];

  @Column({ name: 'rows_json', type: 'jsonb', default: () => "'[]'::jsonb" })
  rowsJson!: any[];

  @Column({ name: 'row_count', type: 'integer', default: 0 })
  rowCount!: number;

  @Column({ name: 'fetched_at', type: 'timestamptz', nullable: true })
  fetchedAt?: Date | null;

  @Column({
    name: 'source_revision',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sourceRevision?: string | null;

  @Column({ name: 'data_hash', type: 'varchar', length: 128, nullable: true })
  dataHash?: string | null;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: SyncStatusEnum,
    enumName: 'sync_status_enum',
    default: SyncStatusEnum.PENDING,
  })
  syncStatus!: SyncStatusEnum;

  @Column({ name: 'sync_error', type: 'text', nullable: true })
  syncError?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => SyncHistory, (syncHistory) => syncHistory.snapshot)
  syncHistories!: SyncHistory[];
}
