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
import { DataSource } from '../../data-sources/entities/data-source.entity';
import { SourceSheet } from '../../source-sheets/entities/source-sheet.entity';
import { View } from '../../views/entities/view.entity';
import { SyncHistory } from '../../sync-histories/entities/sync-history.entity';
import { CellChangeLog } from '../../cell-change-logs/entities/cell-change-log.entity';

@Entity('source_tables')
@Unique('uq_source_tables_id_data_source', ['id', 'dataSourceId'])
@Unique('uq_source_tables_google_table_per_source', [
  'dataSourceId',
  'googleTableId',
])
export class SourceTable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'data_source_id', type: 'uuid' })
  dataSourceId!: string;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.sourceTables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'data_source_id' })
  dataSource!: DataSource;

  @Column({ name: 'source_sheet_id', type: 'uuid' })
  sourceSheetId!: string;

  @ManyToOne(() => SourceSheet, (sourceSheet) => sourceSheet.sourceTables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([
    { name: 'source_sheet_id', referencedColumnName: 'id' },
    { name: 'data_source_id', referencedColumnName: 'dataSourceId' },
  ])
  sourceSheet!: SourceSheet;

  @Column({ name: 'google_table_id', type: 'varchar', length: 255 })
  googleTableId!: string;

  @Column({ name: 'table_name', type: 'varchar', length: 255 })
  tableName!: string;

  @Column({ name: 'start_row_index', type: 'integer' })
  startRowIndex!: number;

  @Column({ name: 'end_row_index', type: 'integer' })
  endRowIndex!: number;

  @Column({ name: 'start_column_index', type: 'integer' })
  startColumnIndex!: number;

  @Column({ name: 'end_column_index', type: 'integer' })
  endColumnIndex!: number;

  @Column({
    name: 'range_a1_notation',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  rangeA1Notation?: string | null;

  @Column({ name: 'has_header', type: 'boolean', default: true })
  hasHeader!: boolean;

  @Column({ name: 'has_footer', type: 'boolean', default: false })
  hasFooter!: boolean;

  @Column({
    name: 'rows_properties_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  rowsPropertiesJson!: Record<string, any>;

  @Column({
    name: 'column_properties_json',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  columnPropertiesJson!: any[];

  @Column({
    name: 'metadata_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadataJson!: Record<string, any>;

  @Column({ name: 'last_synced_at', type: 'timestamptz', nullable: true })
  lastSyncedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => View, (view) => view.sourceTable)
  views!: View[];

  @OneToMany(() => SyncHistory, (syncHistory) => syncHistory.sourceTable)
  syncHistories!: SyncHistory[];

  @OneToMany(() => CellChangeLog, (cellChangeLog) => cellChangeLog.sourceTable)
  cellChangeLogs!: CellChangeLog[];
}
