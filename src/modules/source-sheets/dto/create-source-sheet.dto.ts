import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID source sheet.',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'c26ee66c-dd55-430c-8eb8-47c7f6d51a3d',
    description: 'ID nguồn dữ liệu.',
  })
  @Column({ name: 'data_source_id', type: 'uuid' })
  dataSourceId!: string;

  @ManyToOne(() => DataSource, (dataSource) => dataSource.sourceSheets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'data_source_id' })
  dataSource!: DataSource;

  @ApiProperty({
    example: 'Sheet1',
    description: 'Tên sheet trong bảng tính nguồn.',
  })
  @Column({ name: 'sheet_name', type: 'varchar', length: 255 })
  sheetName!: string;

  @ApiPropertyOptional({
    example: 123456789,
    nullable: true,
    description: 'ID dạng số của Google sheet.',
  })
  @Column({ name: 'google_sheet_id', type: 'integer', nullable: true })
  googleSheetId?: number | null;

  @ApiPropertyOptional({
    example: '0',
    nullable: true,
    description: 'GID của Google sheet.',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  gid?: string | null;

  @ApiProperty({ example: 0, description: 'Thứ tự sắp xếp của sheet.' })
  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @ApiProperty({
    example: false,
    description: 'Cho biết sheet có bị ẩn hay không.',
  })
  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden!: boolean;

  @ApiProperty({
    example: { rowCount: 100 },
    description: 'Metadata bổ sung của sheet.',
  })
  @Column({
    name: 'metadata_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadataJson!: Record<string, any>;

  @ApiProperty({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm tạo.',
  })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm cập nhật gần nhất.',
  })
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
