import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChangeStatusEnum } from '../../../common/enums/database.enums';
import { View } from '../../views/entities/view.entity';
import { SourceSheet } from '../../source-sheets/entities/source-sheet.entity';
import { SourceTable } from '../../source-tables/entities/source-table.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cell_change_logs')
export class CellChangeLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'view_id', type: 'uuid' })
  viewId!: string;

  @ManyToOne(() => View, (view) => view.cellChangeLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'view_id' })
  view!: View;

  @Column({ name: 'source_sheet_id', type: 'uuid' })
  sourceSheetId!: string;

  @ManyToOne(() => SourceSheet, (sourceSheet) => sourceSheet.cellChangeLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'source_sheet_id' })
  sourceSheet!: SourceSheet;

  @Column({ name: 'source_table_id', type: 'uuid', nullable: true })
  sourceTableId?: string | null;

  @ManyToOne(() => SourceTable, (sourceTable) => sourceTable.cellChangeLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'source_table_id' })
  sourceTable?: SourceTable | null;

  @Column({ name: 'changed_by', type: 'uuid', nullable: true })
  changedBy?: string | null;

  @ManyToOne(() => User, (user) => user.cellChangeLogs, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'changed_by' })
  changedByUser?: User | null;

  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId?: string | null;

  @Column({
    name: 'request_status',
    type: 'enum',
    enum: ChangeStatusEnum,
    enumName: 'change_status_enum',
    default: ChangeStatusEnum.PENDING,
  })
  requestStatus!: ChangeStatusEnum;

  @Column({ name: 'row_index', type: 'integer', nullable: true })
  rowIndex?: number | null;

  @Column({ name: 'column_index', type: 'integer', nullable: true })
  columnIndex?: number | null;

  @Column({ name: 'cell_address', type: 'varchar', length: 50 })
  cellAddress!: string;

  @Column({ name: 'old_value', type: 'text', nullable: true })
  oldValue?: string | null;

  @Column({ name: 'new_value', type: 'text', nullable: true })
  newValue?: string | null;

  @Column({
    name: 'source_revision',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  sourceRevision?: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage?: string | null;

  @Column({
    name: 'metadata_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  metadataJson!: Record<string, any>;

  @Column({
    name: 'changed_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  changedAt!: Date;

  @Column({ name: 'applied_at', type: 'timestamptz', nullable: true })
  appliedAt?: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
