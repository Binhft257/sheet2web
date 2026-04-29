import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  SourceStatusEnum,
  SourceTypeEnum,
} from '../../../common/enums/database.enums';
import { User } from '../../users/entities/user.entity';
import { SourceSheet } from '../../source-sheets/entities/source-sheet.entity';
import { SourceTable } from '../../source-tables/entities/source-table.entity';
import { View } from '../../views/entities/view.entity';
import { SyncHistory } from '../../sync-histories/entities/sync-history.entity';

@Entity('data_sources')
@Index(
  'uq_data_sources_owner_source_spreadsheet_active',
  ['ownerId', 'sourceType', 'spreadsheetId'],
  {
    unique: true,
    where: '"spreadsheet_id" IS NOT NULL AND "deleted_at" IS NULL',
  },
)
export class DataSource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.ownedDataSources, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: SourceTypeEnum,
    enumName: 'source_type_enum',
    default: SourceTypeEnum.GOOGLE_SHEET,
  })
  sourceType!: SourceTypeEnum;

  @Column({ name: 'source_url', type: 'text' })
  sourceUrl!: string;

  @Column({
    name: 'spreadsheet_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  spreadsheetId?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string | null;

  @Column({
    name: 'source_status',
    type: 'enum',
    enum: SourceStatusEnum,
    enumName: 'source_status_enum',
    default: SourceStatusEnum.ACTIVE,
  })
  sourceStatus!: SourceStatusEnum;

  @Column({
    name: 'connection_meta_json',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  connectionMetaJson!: Record<string, any>;

  @Column({
    name: 'last_synced_structure_at',
    type: 'timestamptz',
    nullable: true,
  })
  lastSyncedStructureAt?: Date | null;

  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => SourceSheet, (sourceSheet) => sourceSheet.dataSource)
  sourceSheets!: SourceSheet[];

  @OneToMany(() => SourceTable, (sourceTable) => sourceTable.dataSource)
  sourceTables!: SourceTable[];

  @OneToMany(() => View, (view) => view.dataSource)
  views!: View[];

  @OneToMany(() => SyncHistory, (syncHistory) => syncHistory.dataSource)
  syncHistories!: SyncHistory[];
}
