import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SyncStatusEnum } from '../../../common/enums/database.enums';
import { DataSource } from '../../data-sources/entities/data-source.entity';
import { SourceSheet } from '../../source-sheets/entities/source-sheet.entity';
import { SourceTable } from '../../source-tables/entities/source-table.entity';
import { View } from '../../views/entities/view.entity';
import { ViewSnapshot } from '../../view-snapshots/entities/view-snapshot.entity';

@Entity('sync_histories')
export class SyncHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'data_source_id', type: 'uuid', nullable: true })
  dataSourceId?: string | null;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.syncHistories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'data_source_id' })
  dataSource?: DataSource | null;

  @Column({ name: 'source_sheet_id', type: 'uuid', nullable: true })
  sourceSheetId?: string | null;

  @ManyToOne(() => SourceSheet, (sourceSheet) => sourceSheet.syncHistories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'source_sheet_id' })
  sourceSheet?: SourceSheet | null;

  @Column({ name: 'source_table_id', type: 'uuid', nullable: true })
  sourceTableId?: string | null;

  @ManyToOne(() => SourceTable, (sourceTable) => sourceTable.syncHistories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'source_table_id' })
  sourceTable?: SourceTable | null;

  @Column({ name: 'view_id', type: 'uuid', nullable: true })
  viewId?: string | null;

  @ManyToOne(() => View, (view) => view.syncHistories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'view_id' })
  view?: View | null;

  @Column({ name: 'snapshot_id', type: 'uuid', nullable: true })
  snapshotId?: string | null;

  @ManyToOne(() => ViewSnapshot, (snapshot) => snapshot.syncHistories, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'snapshot_id' })
  snapshot?: ViewSnapshot | null;

  @Column({
    name: 'sync_status',
    type: 'enum',
    enum: SyncStatusEnum,
    enumName: 'sync_status_enum',
    default: SyncStatusEnum.PENDING,
  })
  syncStatus!: SyncStatusEnum;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finishedAt?: Date | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({
    name: 'metadata_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadataJson!: Record<string, any>;
}
