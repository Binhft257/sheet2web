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
import { SourceTable } from '../../source-tables/entities/source-table.entity';
import { View } from '../../views/entities/view.entity';
import { SyncHistory } from '../../sync-histories/entities/sync-history.entity';
import { CellChangeLog } from '../../cell-change-logs/entities/cell-change-log.entity';

@Entity('source_sheets')
@Unique('uq_source_sheets_data_source_sheet_name', [
  'dataSourceId',
  'sheetName',
])
@Unique('uq_source_sheets_data_source_google_sheet_id', [
  'dataSourceId',
  'googleSheetId',
])
@Unique('uq_source_sheets_data_source_gid', ['dataSourceId', 'gid'])
@Unique('uq_source_sheets_id_data_source', ['id', 'dataSourceId'])
export class CreateSourceSheetDto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'data_source_id', type: 'uuid' })
  dataSourceId!: string;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.sourceSheets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'data_source_id' })
  dataSource!: DataSource;

  @Column({ name: 'sheet_name', type: 'varchar', length: 255 })
  sheetName!: string;

  @Column({ name: 'google_sheet_id', type: 'integer', nullable: true })
  googleSheetId?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  gid?: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden!: boolean;

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

  @OneToMany(() => SourceTable, (sourceTable) => sourceTable.sourceSheet)
  sourceTables!: SourceTable[];

  @OneToMany(() => View, (view) => view.sourceSheet)
  views!: View[];

  @OneToMany(() => SyncHistory, (syncHistory) => syncHistory.sourceSheet)
  syncHistories!: SyncHistory[];

  @OneToMany(() => CellChangeLog, (cellChangeLog) => cellChangeLog.sourceSheet)
  cellChangeLogs!: CellChangeLog[];
}
