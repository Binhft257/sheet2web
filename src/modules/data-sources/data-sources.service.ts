import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { ListDataSourcesQueryDto } from './dto/list-data-sources-query.dto';
import { PreviewDataSourceDto } from './dto/preview-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource as TypeOrmDataSource,
  IsNull,
  QueryFailedError,
} from 'typeorm';
import { DataSource as DataSourceEntity } from './entities/data-source.entity';
import { SourceSheet } from '../source-sheets/entities/source-sheet.entity';
import {
  SourceStatusEnum,
  SourceTypeEnum,
} from '../../common/enums/database.enums';
import { GoogleSheetsService } from '../../google-sheets/google-sheets.service';
import { extractSpreadsheetId } from './utils/extract-spreadsheet-id';
import {
  GoogleSheetTabMetadata,
  GoogleSheetsMetadata,
} from '../../google-sheets/types/google-sheets-metadata.type';
import {
  buildA1Range,
  escapeSheetName,
  PREVIEW_MAX_ROWS,
  validateRangeA1Notation,
} from './utils/sheet-range.util';

@Injectable()
export class DataSourcesService {
  constructor(
    @InjectDataSource()
    private readonly typeOrmDataSource: TypeOrmDataSource,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async list(userId: string, listDataSourcesQueryDto: ListDataSourcesQueryDto) {
    const { page, limit, skip } = this.resolvePagination(
      listDataSourcesQueryDto.page,
      listDataSourcesQueryDto.limit,
    );
    const normalizedSearch = listDataSourcesQueryDto.search?.trim();

    const queryBuilder = this.typeOrmDataSource.manager
      .createQueryBuilder(DataSourceEntity, 'dataSource')
      .where('dataSource.owner_id = :userId', { userId })
      .andWhere('dataSource.deleted_at IS NULL');

    if (normalizedSearch) {
      queryBuilder.andWhere('dataSource.title ILIKE :search', {
        search: `%${normalizedSearch}%`,
      });
    }

    if (listDataSourcesQueryDto.status) {
      queryBuilder.andWhere('dataSource.source_status = :status', {
        status: listDataSourcesQueryDto.status,
      });
    }

    queryBuilder
      .orderBy('dataSource.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [dataSources, total] = await queryBuilder.getManyAndCount();

    const sheetCountByDataSourceId = new Map<string, number>();
    if (dataSources.length > 0) {
      const dataSourceIds = dataSources.map((dataSource) => dataSource.id);
      const countRows = await this.typeOrmDataSource.manager
        .createQueryBuilder(SourceSheet, 'sourceSheet')
        .select('sourceSheet.data_source_id', 'dataSourceId')
        .addSelect('COUNT(sourceSheet.id)', 'sheetCount')
        .where('sourceSheet.data_source_id IN (:...dataSourceIds)', {
          dataSourceIds,
        })
        .groupBy('sourceSheet.data_source_id')
        .getRawMany<{ dataSourceId: string; sheetCount: string }>();

      for (const countRow of countRows) {
        sheetCountByDataSourceId.set(
          countRow.dataSourceId,
          Number(countRow.sheetCount),
        );
      }
    }

    return {
      items: dataSources.map((dataSource) => ({
        id: dataSource.id,
        title: dataSource.title,
        sourceType: dataSource.sourceType,
        sourceStatus: dataSource.sourceStatus,
        spreadsheetId: dataSource.spreadsheetId,
        sheetCount: sheetCountByDataSourceId.get(dataSource.id) ?? 0,
        lastSyncedStructureAt: dataSource.lastSyncedStructureAt,
        lastError: dataSource.lastError,
        createdAt: dataSource.createdAt,
        updatedAt: dataSource.updatedAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async listSheets(userId: string, dataSourceId: string) {
    const dataSource = await this.typeOrmDataSource.manager.findOne(
      DataSourceEntity,
      {
        where: {
          id: dataSourceId,
          deletedAt: IsNull(),
        },
      },
    );

    if (!dataSource) {
      throw new NotFoundException('Khong tim thay data source');
    }

    if (dataSource.ownerId !== userId) {
      throw new ForbiddenException(
        'Ban khong co quyen truy cap data source nay.',
      );
    }

    const sourceSheets = await this.typeOrmDataSource.manager.find(SourceSheet, {
      where: { dataSourceId },
      order: { sortOrder: 'ASC' },
    });

    return {
      dataSource: {
        id: dataSource.id,
        title: dataSource.title,
        sourceStatus: dataSource.sourceStatus,
      },
      sheets: sourceSheets.map((sourceSheet) => ({
        id: sourceSheet.id,
        sheetName: sourceSheet.sheetName,
        googleSheetId: sourceSheet.googleSheetId,
        gid: sourceSheet.gid,
        sortOrder: sourceSheet.sortOrder,
        isHidden: sourceSheet.isHidden,
        metadata: {
          rowCount: this.readMetadataNumber(sourceSheet.metadataJson, 'rowCount'),
          columnCount: this.readMetadataNumber(
            sourceSheet.metadataJson,
            'columnCount',
          ),
        },
      })),
    };
  }

  async create(userId: string, createDataSourceDto: CreateDataSourceDto) {
    const sourceUrl = createDataSourceDto.sourceUrl.trim();
    const spreadsheetId = extractSpreadsheetId(sourceUrl);
    const metadata =
      await this.googleSheetsService.getSpreadsheetMetadata(spreadsheetId);

    this.validateMetadataHasSheets(metadata);

    const normalizedTitle = createDataSourceDto.title?.trim();
    const resolvedTitle = normalizedTitle || metadata.spreadsheetTitle;

    try {
      return await this.typeOrmDataSource.transaction(async (manager) => {
        const dataSourceToCreate = manager.create(DataSourceEntity, {
          ownerId: userId,
          sourceType: SourceTypeEnum.GOOGLE_SHEET,
          sourceStatus: SourceStatusEnum.ACTIVE,
          sourceUrl,
          spreadsheetId,
          title: resolvedTitle,
          connectionMetaJson: this.buildConnectionMeta(metadata),
          lastSyncedStructureAt: new Date(),
        });

        const savedDataSource = await manager.save(
          DataSourceEntity,
          dataSourceToCreate,
        );

        const sourceSheetsToCreate = metadata.sheets.map((sheet) =>
          manager.create(
            SourceSheet,
            this.buildSourceSheetData(savedDataSource.id, sheet),
          ),
        );

        const savedSourceSheets = await manager.save(
          SourceSheet,
          sourceSheetsToCreate,
        );

        return this.toResponse(savedDataSource, savedSourceSheets);
      });
    } catch (error) {
      this.throwIfDataSourceAlreadyExists(error);
      throw error;
    }
  }

  async update(
    userId: string,
    dataSourceId: string,
    updateDataSourceDto: UpdateDataSourceDto,
  ) {
    const incomingSourceUrl = updateDataSourceDto.sourceUrl;
    const hasSourceUrl = typeof incomingSourceUrl === 'string';
    const hasTitle = typeof updateDataSourceDto.title === 'string';

    let sourceUrl: string | undefined;
    let spreadsheetId: string | undefined;
    let metadata: GoogleSheetsMetadata | undefined;

    if (hasSourceUrl) {
      sourceUrl = incomingSourceUrl.trim();
      spreadsheetId = extractSpreadsheetId(sourceUrl);
      metadata =
        await this.googleSheetsService.getSpreadsheetMetadata(spreadsheetId);
      this.validateMetadataHasSheets(metadata);
    }

    try {
      return await this.typeOrmDataSource.transaction(async (manager) => {
        const dataSource = await manager.findOne(DataSourceEntity, {
          where: { id: dataSourceId, ownerId: userId },
        });

        if (!dataSource) {
          throw new NotFoundException('Khong tim thay data source');
        }

        const previousSpreadsheetId = dataSource.spreadsheetId;

        if (metadata && sourceUrl && spreadsheetId) {
          dataSource.sourceUrl = sourceUrl;
          dataSource.spreadsheetId = spreadsheetId;
          dataSource.connectionMetaJson = this.buildConnectionMeta(metadata);
          dataSource.lastSyncedStructureAt = new Date();
        }

        if (hasTitle) {
          const normalizedTitle = updateDataSourceDto.title?.trim();
          dataSource.title =
            normalizedTitle ||
            metadata?.spreadsheetTitle ||
            dataSource.title ||
            null;
        }

        const savedDataSource = await manager.save(DataSourceEntity, dataSource);

        let savedSourceSheets: SourceSheet[];
        if (metadata) {
          const existingSourceSheets = await manager.find(SourceSheet, {
            where: { dataSourceId: savedDataSource.id },
          });

          const hasSpreadsheetChanged =
            previousSpreadsheetId !== savedDataSource.spreadsheetId;
          const incomingGoogleSheetIds = new Set(
            metadata.sheets.map((sheet) => sheet.googleSheetId),
          );
          const staleSourceSheetIds = existingSourceSheets
            .filter(
              (sheet) =>
                hasSpreadsheetChanged ||
                sheet.googleSheetId == null ||
                !incomingGoogleSheetIds.has(sheet.googleSheetId),
            )
            .map((sheet) => sheet.id);

          if (staleSourceSheetIds.length > 0) {
            await manager.delete(SourceSheet, staleSourceSheetIds);
          }

          const existingSheetsByGoogleSheetId = new Map(
            (hasSpreadsheetChanged ? [] : existingSourceSheets)
              .filter((sheet) => typeof sheet.googleSheetId === 'number')
              .map((sheet) => [sheet.googleSheetId as number, sheet]),
          );

          const sourceSheetsToSave = metadata.sheets.map((sheet) => {
            const existingSheet = existingSheetsByGoogleSheetId.get(
              sheet.googleSheetId,
            );

            if (existingSheet) {
              existingSheet.sheetName = sheet.sheetName;
              existingSheet.gid = sheet.gid;
              existingSheet.sortOrder = sheet.sortOrder;
              existingSheet.isHidden = sheet.isHidden;
              existingSheet.metadataJson = sheet.metadataJson;
              return existingSheet;
            }

            return manager.create(
              SourceSheet,
              this.buildSourceSheetData(savedDataSource.id, sheet),
            );
          });

          await manager.save(SourceSheet, sourceSheetsToSave);
          savedSourceSheets = await manager.find(SourceSheet, {
            where: { dataSourceId: savedDataSource.id },
            order: { sortOrder: 'ASC' },
          });
        } else {
          savedSourceSheets = await manager.find(SourceSheet, {
            where: { dataSourceId: savedDataSource.id },
            order: { sortOrder: 'ASC' },
          });
        }

        return this.toResponse(savedDataSource, savedSourceSheets);
      });
    } catch (error) {
      this.throwIfDataSourceAlreadyExists(error);
      throw error;
    }
  }

  async preview(
    userId: string,
    dataSourceId: string,
    previewDataSourceDto: PreviewDataSourceDto,
  ) {
    const dataSource = await this.typeOrmDataSource.manager.findOne(
      DataSourceEntity,
      {
        where: {
          id: dataSourceId,
          deletedAt: IsNull(),
        },
      },
    );

    if (!dataSource) {
      throw new NotFoundException('Khong tim thay nguon du lieu.');
    }

    if (dataSource.ownerId !== userId) {
      throw new ForbiddenException(
        'Ban khong co quyen preview nguon du lieu nay.',
      );
    }

    const sourceSheet = await this.typeOrmDataSource.manager.findOne(SourceSheet, {
      where: {
        id: previewDataSourceDto.sourceSheetId,
        dataSourceId: dataSourceId,
      },
    });

    if (!sourceSheet) {
      throw new NotFoundException('Khong tim thay sheet trong nguon du lieu nay.');
    }

    if (!dataSource.spreadsheetId) {
      throw new BadRequestException('Nguon du lieu khong co spreadsheet id hop le.');
    }

    const normalizedRange = previewDataSourceDto.rangeA1Notation.trim();
    const safeRangeA1Notation = normalizedRange
      ? validateRangeA1Notation(normalizedRange)
      : '';
    const fullRange = safeRangeA1Notation
      ? buildA1Range(sourceSheet.sheetName, safeRangeA1Notation)
      : escapeSheetName(sourceSheet.sheetName);

    const values = await this.googleSheetsService.getValues(
      dataSource.spreadsheetId,
      fullRange,
    );

    const useFirstRowAsHeader = previewDataSourceDto.useFirstRowAsHeader ?? true;
    const { headers, rows } = this.normalizePreviewRows(
      values,
      useFirstRowAsHeader,
      PREVIEW_MAX_ROWS,
    );

    return {
      dataSourceId: dataSource.id,
      sourceSheetId: sourceSheet.id,
      sheetName: sourceSheet.sheetName,
      rangeA1Notation: safeRangeA1Notation,
      headers,
      rows,
      rowCount: rows.length,
      previewedAt: new Date().toISOString(),
    };
  }

  private validateMetadataHasSheets(metadata: GoogleSheetsMetadata) {
    if (metadata.sheets.length === 0) {
      throw new BadRequestException('Google Sheet khong co sheet nao de dong bo');
    }
  }

  private buildConnectionMeta(metadata: GoogleSheetsMetadata) {
    const connectionMetaJson: Record<string, unknown> = {
      spreadsheetTitle: metadata.spreadsheetTitle,
      sheetCount: metadata.sheets.length,
    };

    if (metadata.locale) {
      connectionMetaJson.locale = metadata.locale;
    }
    if (metadata.timeZone) {
      connectionMetaJson.timeZone = metadata.timeZone;
    }

    return connectionMetaJson;
  }

  private buildSourceSheetData(
    dataSourceId: string,
    sheet: GoogleSheetTabMetadata,
  ) {
    return {
      dataSourceId,
      sheetName: sheet.sheetName,
      googleSheetId: sheet.googleSheetId,
      gid: sheet.gid,
      sortOrder: sheet.sortOrder,
      isHidden: sheet.isHidden,
      metadataJson: sheet.metadataJson,
    };
  }

  private normalizePreviewRows(
    values: string[][],
    useFirstRowAsHeader: boolean,
    maxRows: number,
  ) {
    if (!values.length) {
      return {
        headers: [] as string[],
        rows: [] as string[][],
      };
    }

    if (useFirstRowAsHeader) {
      const [headerRow, ...restRows] = values;
      const rows = restRows.slice(0, maxRows);
      return {
        headers: [...headerRow],
        rows,
      };
    }

    const rows = values.slice(0, maxRows);
    const maxColumns = rows.reduce(
      (currentMax, row) => Math.max(currentMax, row.length),
      0,
    );
    const headers = Array.from(
      { length: maxColumns },
      (_, index) => `Column ${index + 1}`,
    );

    return {
      headers,
      rows,
    };
  }

  private toResponse(dataSource: DataSourceEntity, sourceSheets: SourceSheet[]) {
    return {
      id: dataSource.id,
      title: dataSource.title,
      sourceType: dataSource.sourceType,
      sourceStatus: dataSource.sourceStatus,
      spreadsheetId: dataSource.spreadsheetId,
      sheets: sourceSheets.map((sourceSheet) => ({
        id: sourceSheet.id,
        sheetName: sourceSheet.sheetName,
        googleSheetId: sourceSheet.googleSheetId,
        gid: sourceSheet.gid,
        sortOrder: sourceSheet.sortOrder,
        isHidden: sourceSheet.isHidden,
      })),
    };
  }

  private throwIfDataSourceAlreadyExists(error: unknown) {
    if (!(error instanceof QueryFailedError)) {
      return;
    }

    const driverError = (
      error as QueryFailedError & {
        driverError?: {
          code?: string;
          constraint?: string;
          table?: string;
          detail?: string;
        };
      }
    ).driverError;

    if (driverError?.code !== '23505') {
      return;
    }

    const constraint = driverError.constraint?.toLowerCase() ?? '';
    const table = driverError.table?.toLowerCase() ?? '';
    const detail = driverError.detail?.toLowerCase() ?? '';

    const isDataSourceDuplicate =
      constraint === 'uq_data_sources_owner_source_spreadsheet_active' ||
      table === 'data_sources' ||
      constraint.includes('data_sources') ||
      detail.includes('data_sources') ||
      detail.includes('source_url') ||
      detail.includes('spreadsheet_id') ||
      detail.includes('owner_id');

    if (isDataSourceDuplicate) {
      throw new ConflictException('Data source nay da ton tai');
    }
  }

  private resolvePagination(page?: number, limit?: number) {
    const parsedPage = Number(page ?? 1);
    const parsedLimit = Number(limit ?? 20);

    const safePage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 20;

    return {
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    };
  }

  private readMetadataNumber(
    metadata: Record<string, unknown> | undefined | null,
    key: 'rowCount' | 'columnCount',
  ) {
    const value = metadata?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  }
}
