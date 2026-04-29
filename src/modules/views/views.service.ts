import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { ListMyViewsQueryDto } from './dto/list-my-views-query.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource as TypeOrmDataSource,
  EntityManager,
  IsNull,
  QueryFailedError,
} from 'typeorm';
import { View } from './entities/view.entity';
import {
  SelectionTypeEnum,
  SyncStatusEnum,
  ViewStatusEnum,
} from '../../common/enums/database.enums';
import { DataSource as DataSourceEntity } from '../data-sources/entities/data-source.entity';
import { SourceSheet } from '../source-sheets/entities/source-sheet.entity';
import { createBaseSlug } from './utils/slug.util';
import {
  buildA1Range,
  escapeSheetName,
  validateRangeA1Notation,
} from '../data-sources/utils/sheet-range.util';
import { GoogleSheetsService } from '../../google-sheets/google-sheets.service';
import { ViewSnapshot } from '../view-snapshots/entities/view-snapshot.entity';

@Injectable()
export class ViewsService {
  constructor(
    @InjectDataSource()
    private readonly typeOrmDataSource: TypeOrmDataSource,
    private readonly googleSheetsService: GoogleSheetsService,
  ) {}

  async listMy(userId: string, listMyViewsQueryDto: ListMyViewsQueryDto) {
    const { page, limit, skip } = this.resolvePagination(
      listMyViewsQueryDto.page,
      listMyViewsQueryDto.limit,
    );
    const normalizedSearch = listMyViewsQueryDto.search?.trim();

    const queryBuilder = this.typeOrmDataSource.manager
      .createQueryBuilder(View, 'view')
      .where('view.owner_id = :userId', { userId })
      .andWhere('view.deleted_at IS NULL');

    if (normalizedSearch) {
      queryBuilder.andWhere('view.name ILIKE :search', {
        search: `%${normalizedSearch}%`,
      });
    }

    if (listMyViewsQueryDto.status) {
      queryBuilder.andWhere('view.status = :status', {
        status: listMyViewsQueryDto.status,
      });
    }

    if (listMyViewsQueryDto.accessMode) {
      queryBuilder.andWhere('view.access_mode = :accessMode', {
        accessMode: listMyViewsQueryDto.accessMode,
      });
    }

    queryBuilder
      .orderBy('view.updated_at', 'DESC')
      .addOrderBy('view.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [views, total] = await queryBuilder.getManyAndCount();

    if (views.length === 0) {
      return {
        items: [],
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    const viewIds = views.map((view) => view.id);
    const dataSourceIds = Array.from(
      new Set(views.map((view) => view.dataSourceId).filter((id) => !!id)),
    );
    const sourceSheetIds = Array.from(
      new Set(views.map((view) => view.sourceSheetId).filter((id) => !!id)),
    );

    const [dataSources, sourceSheets, currentSnapshots] = await Promise.all([
      dataSourceIds.length === 0
        ? Promise.resolve([] as DataSourceEntity[])
        : this.typeOrmDataSource.manager
            .createQueryBuilder(DataSourceEntity, 'dataSource')
            .where('dataSource.id IN (:...dataSourceIds)', { dataSourceIds })
            .andWhere('dataSource.deleted_at IS NULL')
            .getMany(),
      sourceSheetIds.length === 0
        ? Promise.resolve([] as SourceSheet[])
        : this.typeOrmDataSource.manager
            .createQueryBuilder(SourceSheet, 'sourceSheet')
            .where('sourceSheet.id IN (:...sourceSheetIds)', { sourceSheetIds })
            .getMany(),
      this.typeOrmDataSource.manager
        .createQueryBuilder(ViewSnapshot, 'snapshot')
        .where('snapshot.view_id IN (:...viewIds)', { viewIds })
        .andWhere('snapshot.is_current = true')
        .orderBy('snapshot.view_id', 'ASC')
        .addOrderBy('snapshot.version_no', 'DESC')
        .getMany(),
    ]);

    const dataSourceById = new Map(dataSources.map((dataSource) => [dataSource.id, dataSource]));
    const sourceSheetById = new Map(sourceSheets.map((sourceSheet) => [sourceSheet.id, sourceSheet]));
    const currentSnapshotByViewId = new Map<string, ViewSnapshot>();
    for (const currentSnapshot of currentSnapshots) {
      if (!currentSnapshotByViewId.has(currentSnapshot.viewId)) {
        currentSnapshotByViewId.set(currentSnapshot.viewId, currentSnapshot);
      }
    }

    return {
      items: views.map((view) => {
        const dataSource = dataSourceById.get(view.dataSourceId);
        const sourceSheet = view.sourceSheetId
          ? sourceSheetById.get(view.sourceSheetId)
          : undefined;
        const currentSnapshot = currentSnapshotByViewId.get(view.id);

        return {
          id: view.id,
          name: view.name,
          slug: view.slug,
          status: view.status,
          accessMode: view.accessMode,
          selectionType: view.selectionType,
          rangeA1Notation: view.rangeA1Notation,
          useFirstRowAsHeader: view.useFirstRowAsHeader,
          refreshIntervalSeconds: view.refreshIntervalSeconds,
          allowThemeSwitch: view.allowThemeSwitch,
          lastPublishedAt: view.lastPublishedAt,
          createdAt: view.createdAt,
          updatedAt: view.updatedAt,
          dataSource: dataSource
            ? {
                id: dataSource.id,
                title: dataSource.title,
              }
            : null,
          sourceSheet: sourceSheet
            ? {
                id: sourceSheet.id,
                sheetName: sourceSheet.sheetName,
              }
            : null,
          currentSnapshot: currentSnapshot
            ? {
                id: currentSnapshot.id,
                versionNo: Number(currentSnapshot.versionNo),
                rowCount: currentSnapshot.rowCount,
                fetchedAt: currentSnapshot.fetchedAt,
              }
            : null,
          publicUrl: `/v/${view.slug}`,
        };
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(userId: string, createViewDto: CreateViewDto) {
    const normalizedName = createViewDto.name?.trim();
    const normalizedRange = createViewDto.rangeA1Notation?.trim();

    this.validateSelectionRules(
      createViewDto.selectionType,
      createViewDto.sourceSheetId,
      normalizedRange,
    );

    if (createViewDto.selectionType === SelectionTypeEnum.RANGE && normalizedRange) {
      validateRangeA1Notation(normalizedRange, Number.MAX_SAFE_INTEGER);
    }

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.typeOrmDataSource.transaction(async (manager) => {
          const dataSource = await manager.findOne(DataSourceEntity, {
            where: {
              id: createViewDto.dataSourceId,
              deletedAt: IsNull(),
            },
          });

          if (!dataSource) {
            throw new NotFoundException('Khong tim thay nguon du lieu.');
          }

          if (dataSource.ownerId !== userId) {
            throw new ForbiddenException(
              'Ban khong co quyen tao view cho nguon du lieu nay.',
            );
          }

          const sourceSheet = await manager.findOne(SourceSheet, {
            where: {
              id: createViewDto.sourceSheetId!,
              dataSourceId: createViewDto.dataSourceId,
            },
          });

          if (!sourceSheet) {
            throw new NotFoundException(
              'Khong tim thay sheet trong nguon du lieu nay.',
            );
          }

          const resolvedName = normalizedName || sourceSheet.sheetName?.trim();
          if (!resolvedName) {
            throw new BadRequestException('Khong the xac dinh ten view.');
          }

          const slug = await this.generateUniqueSlug(manager, resolvedName);

          const viewToCreate = manager.create(View, {
            ownerId: userId,
            dataSourceId: createViewDto.dataSourceId,
            sourceSheetId: createViewDto.sourceSheetId!,
            sourceTableId: null,
            themeId: createViewDto.themeId ?? null,
            name: resolvedName,
            slug,
            accessMode: createViewDto.accessMode,
            status: ViewStatusEnum.DRAFT,
            selectionType: createViewDto.selectionType,
            rangeA1Notation:
              createViewDto.selectionType === SelectionTypeEnum.RANGE
                ? normalizedRange
                : null,
            useFirstRowAsHeader: createViewDto.useFirstRowAsHeader ?? true,
            refreshIntervalSeconds: createViewDto.refreshIntervalSeconds ?? 60,
            allowThemeSwitch: createViewDto.allowThemeSwitch ?? false,
            themeOverrideJson: createViewDto.themeOverrideJson ?? {},
            settingsJson: createViewDto.settingsJson ?? {},
          });

          const savedView = await manager.save(View, viewToCreate);
          return this.toCreateResponse(savedView);
        });
      } catch (error) {
        if (this.isSlugUniqueViolation(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Khong the tao slug duy nhat cho view nay.');
  }

  async update(userId: string, viewId: string, updateViewDto: UpdateViewDto) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.typeOrmDataSource.transaction(async (manager) => {
          const view = await manager.findOne(View, {
            where: { id: viewId, deletedAt: IsNull() },
          });

          if (!view) {
            throw new NotFoundException('Khong tim thay view.');
          }

          if (view.ownerId !== userId) {
            throw new ForbiddenException('Ban khong co quyen sua view nay.');
          }

          if (view.status !== ViewStatusEnum.DRAFT) {
            throw new BadRequestException('Chi co the sua view nhap.');
          }

          const nextSelectionType = updateViewDto.selectionType ?? view.selectionType;
          const nextSourceSheetId =
            updateViewDto.sourceSheetId !== undefined
              ? updateViewDto.sourceSheetId
              : view.sourceSheetId;
          let normalizedRange: string | null;
          if (nextSelectionType === SelectionTypeEnum.FULL_SHEET) {
            const incomingRange =
              typeof updateViewDto.rangeA1Notation === 'string'
                ? updateViewDto.rangeA1Notation.trim()
                : null;
            if (incomingRange) {
              throw new BadRequestException(
                'full_sheet khong cho phep rangeA1Notation.',
              );
            }
            normalizedRange = null;
          } else {
            const rangeCandidate =
              updateViewDto.rangeA1Notation !== undefined
                ? updateViewDto.rangeA1Notation
                : view.rangeA1Notation;
            normalizedRange =
              typeof rangeCandidate === 'string' ? rangeCandidate.trim() : null;
          }

          this.validateSelectionRules(
            nextSelectionType,
            nextSourceSheetId,
            normalizedRange ?? undefined,
          );

          if (nextSelectionType === SelectionTypeEnum.RANGE) {
            validateRangeA1Notation(
              normalizedRange as string,
              Number.MAX_SAFE_INTEGER,
            );
          }

          const sourceSheet = await manager.findOne(SourceSheet, {
            where: {
              id: nextSourceSheetId!,
              dataSourceId: view.dataSourceId,
            },
          });

          if (!sourceSheet) {
            throw new NotFoundException(
              'Khong tim thay sheet trong nguon du lieu nay.',
            );
          }

          let nextName = view.name;
          if (updateViewDto.name !== undefined) {
            const normalizedName = updateViewDto.name.trim();
            if (!normalizedName) {
              throw new BadRequestException('name khong duoc de trong.');
            }
            nextName = normalizedName;
          }

          if (nextName !== view.name) {
            view.slug = await this.generateUniqueSlug(manager, nextName, view.id);
          }

          view.name = nextName;
          view.sourceSheetId = nextSourceSheetId;
          view.selectionType = nextSelectionType;
          view.rangeA1Notation =
            nextSelectionType === SelectionTypeEnum.RANGE
              ? (normalizedRange as string)
              : null;

          if (updateViewDto.accessMode !== undefined) {
            view.accessMode = updateViewDto.accessMode;
          }
          if (updateViewDto.useFirstRowAsHeader !== undefined) {
            view.useFirstRowAsHeader = updateViewDto.useFirstRowAsHeader;
          }
          if (updateViewDto.refreshIntervalSeconds !== undefined) {
            view.refreshIntervalSeconds = updateViewDto.refreshIntervalSeconds;
          }
          if (updateViewDto.allowThemeSwitch !== undefined) {
            view.allowThemeSwitch = updateViewDto.allowThemeSwitch;
          }
          if (updateViewDto.themeId !== undefined) {
            view.themeId = updateViewDto.themeId ?? null;
          }
          if (updateViewDto.themeOverrideJson !== undefined) {
            view.themeOverrideJson = updateViewDto.themeOverrideJson;
          }
          if (updateViewDto.settingsJson !== undefined) {
            view.settingsJson = updateViewDto.settingsJson;
          }

          const savedView = await manager.save(View, view);
          return this.toUpdateResponse(savedView);
        });
      } catch (error) {
        if (this.isSlugUniqueViolation(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Khong the tao slug duy nhat cho view nay.');
  }

  async publish(userId: string, viewId: string) {
    const view = await this.typeOrmDataSource.manager.findOne(View, {
      where: { id: viewId, deletedAt: IsNull() },
    });

    if (!view) {
      throw new NotFoundException('Khong tim thay view.');
    }

    if (view.ownerId !== userId) {
      throw new ForbiddenException('Ban khong co quyen publish view nay.');
    }

    this.validatePublishSelection(view);

    const dataSource = await this.typeOrmDataSource.manager.findOne(
      DataSourceEntity,
      {
        where: {
          id: view.dataSourceId,
          deletedAt: IsNull(),
        },
      },
    );

    if (!dataSource) {
      throw new NotFoundException('Khong tim thay nguon du lieu.');
    }

    if (dataSource.ownerId !== userId) {
      throw new ForbiddenException('Ban khong co quyen publish view nay.');
    }

    if (!dataSource.spreadsheetId) {
      throw new BadRequestException('Nguon du lieu khong co spreadsheet id hop le.');
    }

    const sourceSheet = await this.typeOrmDataSource.manager.findOne(SourceSheet, {
      where: {
        id: view.sourceSheetId!,
        dataSourceId: view.dataSourceId,
      },
    });

    if (!sourceSheet) {
      throw new NotFoundException('Khong tim thay sheet trong nguon du lieu nay.');
    }

    const resolvedRange = this.resolvePublishRange(view, sourceSheet.sheetName);
    const values = await this.googleSheetsService.getValues(
      dataSource.spreadsheetId,
      resolvedRange,
    );
    const { headers, rows } = this.normalizeSnapshotRows(
      values,
      view.useFirstRowAsHeader,
    );

    return await this.typeOrmDataSource.transaction(async (manager) => {
      const freshView = await manager.findOne(View, {
        where: { id: view.id, deletedAt: IsNull() },
      });

      if (!freshView) {
        throw new NotFoundException('Khong tim thay view.');
      }

      if (freshView.ownerId !== userId) {
        throw new ForbiddenException('Ban khong co quyen publish view nay.');
      }

      await manager
        .createQueryBuilder()
        .update(ViewSnapshot)
        .set({ isCurrent: false })
        .where('view_id = :viewId', { viewId: freshView.id })
        .andWhere('is_current = true')
        .execute();

      const rawMaxVersion = await manager
        .createQueryBuilder(ViewSnapshot, 'snapshot')
        .select('MAX(snapshot.version_no)', 'maxVersion')
        .where('snapshot.view_id = :viewId', { viewId: freshView.id })
        .getRawOne<{ maxVersion: string | null }>();

      const currentMaxVersion = Number(rawMaxVersion?.maxVersion ?? 0);
      const nextVersion = Number.isFinite(currentMaxVersion)
        ? currentMaxVersion + 1
        : 1;

      const snapshotToCreate = manager.create(ViewSnapshot, {
        viewId: freshView.id,
        versionNo: String(nextVersion),
        isCurrent: true,
        resolvedSelectionType: freshView.selectionType,
        resolvedSheetNameSnapshot: sourceSheet.sheetName,
        resolvedTableNameSnapshot: null,
        resolvedRangeA1: resolvedRange,
        resolvedMetaJson: {},
        headersJson: headers,
        rowsJson: rows,
        rowCount: rows.length,
        fetchedAt: new Date(),
        syncStatus: SyncStatusEnum.SUCCESS,
      });

      const savedSnapshot = await manager.save(ViewSnapshot, snapshotToCreate);

      freshView.status = ViewStatusEnum.PUBLISHED;
      freshView.lastPublishedAt = new Date();
      const savedView = await manager.save(View, freshView);

      const snapshotRows = await manager
        .createQueryBuilder(ViewSnapshot, 'snapshot')
        .select('snapshot.id', 'id')
        .where('snapshot.view_id = :viewId', { viewId: freshView.id })
        .orderBy('snapshot.version_no', 'DESC')
        .getRawMany<{ id: string }>();

      const staleSnapshotIds = snapshotRows.slice(5).map((row) => row.id);
      if (staleSnapshotIds.length > 0) {
        await manager.delete(ViewSnapshot, staleSnapshotIds);
      }

      return {
        id: savedView.id,
        slug: savedView.slug,
        status: savedView.status,
        publishedAt: savedView.lastPublishedAt,
        snapshot: {
          id: savedSnapshot.id,
          versionNo: Number(savedSnapshot.versionNo),
          rowCount: savedSnapshot.rowCount,
          fetchedAt: savedSnapshot.fetchedAt,
        },
        url: `/v/${savedView.slug}`,
      };
    });
  }

  findAll() {
    return `This action returns all views`;
  }

  findOne(id: number) {
    return `This action returns a #${id} view`;
  }

  remove(id: number) {
    return `This action removes a #${id} view`;
  }

  private validateSelectionRules(
    selectionType: SelectionTypeEnum,
    sourceSheetId?: string | null,
    rangeA1Notation?: string,
  ) {
    if (selectionType === SelectionTypeEnum.TABLE) {
      throw new BadRequestException(
        'Selection type table chua duoc ho tro o phase nay.',
      );
    }

    if (
      selectionType !== SelectionTypeEnum.FULL_SHEET &&
      selectionType !== SelectionTypeEnum.RANGE
    ) {
      throw new BadRequestException('Selection type khong hop le.');
    }

    if (!sourceSheetId) {
      throw new BadRequestException('sourceSheetId la bat buoc.');
    }

    if (selectionType === SelectionTypeEnum.FULL_SHEET && rangeA1Notation) {
      throw new BadRequestException(
        'full_sheet khong cho phep rangeA1Notation.',
      );
    }

    if (selectionType === SelectionTypeEnum.RANGE && !rangeA1Notation) {
      throw new BadRequestException('rangeA1Notation la bat buoc cho range.');
    }
  }

  private validatePublishSelection(view: View) {
    if (view.selectionType === SelectionTypeEnum.TABLE) {
      throw new BadRequestException(
        'Selection type table chua duoc ho tro o phase nay.',
      );
    }

    if (!view.dataSourceId) {
      throw new BadRequestException('View khong co data source hop le.');
    }

    if (!view.sourceSheetId) {
      throw new BadRequestException('View khong co source sheet hop le.');
    }

    if (
      view.selectionType === SelectionTypeEnum.RANGE &&
      !view.rangeA1Notation?.trim()
    ) {
      throw new BadRequestException('View khong co rangeA1Notation hop le.');
    }
  }

  private resolvePublishRange(view: View, sheetName: string) {
    if (view.selectionType === SelectionTypeEnum.FULL_SHEET) {
      return escapeSheetName(sheetName);
    }

    const safeRange = validateRangeA1Notation(
      view.rangeA1Notation as string,
      Number.MAX_SAFE_INTEGER,
    );
    return buildA1Range(sheetName, safeRange);
  }

  private normalizeSnapshotRows(values: string[][], useFirstRowAsHeader: boolean) {
    if (!values.length) {
      return {
        headers: [] as string[],
        rows: [] as string[][],
      };
    }

    if (useFirstRowAsHeader) {
      const [headerRow, ...restRows] = values;
      return {
        headers: [...headerRow],
        rows: restRows,
      };
    }

    const maxColumns = values.reduce(
      (currentMax, row) => Math.max(currentMax, row.length),
      0,
    );
    const headers = Array.from(
      { length: maxColumns },
      (_, index) => `Column ${index + 1}`,
    );

    return {
      headers,
      rows: values,
    };
  }

  private async generateUniqueSlug(
    manager: EntityManager,
    viewName: string,
    excludeViewId?: string,
  ) {
    const baseSlug = createBaseSlug(viewName);
    let suffix = 1;

    while (suffix <= 1000) {
      const candidate = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
      const query = manager
        .createQueryBuilder(View, 'view')
        .where('LOWER(view.slug) = LOWER(:slug)', { slug: candidate })
        .andWhere('view.deleted_at IS NULL');

      if (excludeViewId) {
        query.andWhere('view.id != :excludeViewId', { excludeViewId });
      }

      const existed = await query.getExists();
      if (!existed) {
        return candidate;
      }

      suffix += 1;
    }

    throw new ConflictException('Khong the tao slug duy nhat cho view nay.');
  }

  private isSlugUniqueViolation(error: unknown) {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = (
      error as QueryFailedError & {
        driverError?: {
          code?: string;
          table?: string;
          constraint?: string;
          detail?: string;
        };
      }
    ).driverError;

    if (driverError?.code !== '23505') {
      return false;
    }

    const table = driverError.table?.toLowerCase() ?? '';
    const constraint = driverError.constraint?.toLowerCase() ?? '';
    const detail = driverError.detail?.toLowerCase() ?? '';

    return (
      table === 'views' ||
      constraint.includes('view') ||
      constraint.includes('slug') ||
      detail.includes('view') ||
      detail.includes('slug')
    );
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

  private toCreateResponse(view: View) {
    return {
      id: view.id,
      name: view.name,
      slug: view.slug,
      status: view.status,
      accessMode: view.accessMode,
      selectionType: view.selectionType,
      dataSourceId: view.dataSourceId,
      sourceSheetId: view.sourceSheetId,
      rangeA1Notation: view.rangeA1Notation,
      useFirstRowAsHeader: view.useFirstRowAsHeader,
      refreshIntervalSeconds: view.refreshIntervalSeconds,
      allowThemeSwitch: view.allowThemeSwitch,
      createdAt: view.createdAt,
    };
  }

  private toUpdateResponse(view: View) {
    return {
      id: view.id,
      name: view.name,
      slug: view.slug,
      status: view.status,
      accessMode: view.accessMode,
      selectionType: view.selectionType,
      dataSourceId: view.dataSourceId,
      sourceSheetId: view.sourceSheetId,
      rangeA1Notation: view.rangeA1Notation,
      useFirstRowAsHeader: view.useFirstRowAsHeader,
      refreshIntervalSeconds: view.refreshIntervalSeconds,
      allowThemeSwitch: view.allowThemeSwitch,
      updatedAt: view.updatedAt,
    };
  }
}
