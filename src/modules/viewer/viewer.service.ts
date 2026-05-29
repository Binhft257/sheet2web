import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource as TypeOrmDataSource, SelectQueryBuilder } from 'typeorm';
import {
  AccessModeEnum,
  PermissionTypeEnum,
  SyncStatusEnum,
  ViewStatusEnum,
} from '../../common/enums/database.enums';
import { User } from '../users/entities/user.entity';
import { ViewPermission } from '../view-permissions/entities/view-permission.entity';
import { ViewSnapshot } from '../view-snapshots/entities/view-snapshot.entity';
import { View } from '../views/entities/view.entity';
import {
  ListViewerViewsQueryDto,
  ViewerViewsSortEnum,
} from './dto/list-viewer-views-query.dto';

type SharedViewRow = {
  view_id: string;
  view_name: string;
  view_slug: string;
  view_access_mode: AccessModeEnum;
  permission_type: PermissionTypeEnum;
  owner_id: string;
  owner_full_name: string;
  owner_email: string;
  snapshot_id: string | null;
  snapshot_version_no: string | null;
  snapshot_row_count: number | string | null;
  snapshot_fetched_at: Date | null;
  snapshot_sync_status: SyncStatusEnum | null;
  shared_at: Date;
};

@Injectable()
export class ViewerService {
  constructor(
    @InjectDataSource()
    private readonly typeOrmDataSource: TypeOrmDataSource,
  ) {}

  async getDashboard(userId: string) {
    const baseQuery = this.createSharedViewsQuery(userId);
    const totalSharedViews = await this.countSharedViews(baseQuery);
    const recentRows = await baseQuery
      .clone()
      .select(this.sharedViewSelects())
      .orderBy('permission.created_at', 'DESC')
      .limit(5)
      .getRawMany<SharedViewRow>();

    return {
      totalSharedViews,
      recentSharedViews: recentRows.map((row) =>
        this.toSharedViewResponse(row, false),
      ),
    };
  }

  async listViews(
    userId: string,
    listViewerViewsQueryDto: ListViewerViewsQueryDto,
  ) {
    const { page, limit, skip } = this.resolvePagination(
      listViewerViewsQueryDto.page,
      listViewerViewsQueryDto.limit,
    );
    const normalizedSearch = listViewerViewsQueryDto.search?.trim();

    const baseQuery = this.createSharedViewsQuery(userId);

    if (normalizedSearch) {
      baseQuery.andWhere('view.name ILIKE :search', {
        search: `%${normalizedSearch}%`,
      });
    }

    if (listViewerViewsQueryDto.accessMode) {
      baseQuery.andWhere('view.access_mode = :accessMode', {
        accessMode: listViewerViewsQueryDto.accessMode,
      });
    }

    const total = await this.countSharedViews(baseQuery);
    const rows = await this.applySort(
      baseQuery.clone().select(this.sharedViewSelects()),
      listViewerViewsQueryDto.sort,
    )
      .offset(skip)
      .limit(limit)
      .getRawMany<SharedViewRow>();

    return {
      items: rows.map((row) => this.toSharedViewResponse(row, true)),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private createSharedViewsQuery(userId: string) {
    return this.typeOrmDataSource.manager
      .createQueryBuilder(ViewPermission, 'permission')
      .innerJoin(View, 'view', 'view.id = permission.view_id')
      .innerJoin(User, 'owner', 'owner.id = view.owner_id')
      .leftJoin(
        ViewSnapshot,
        'snapshot',
        'snapshot.view_id = view.id AND snapshot.is_current = true',
      )
      .where('permission.user_id = :userId', { userId })
      .andWhere('view.status = :status', { status: ViewStatusEnum.PUBLISHED })
      .andWhere('view.deleted_at IS NULL');
  }

  private sharedViewSelects() {
    return [
      'view.id AS view_id',
      'view.name AS view_name',
      'view.slug AS view_slug',
      'view.access_mode AS view_access_mode',
      'permission.permission_type AS permission_type',
      'owner.id AS owner_id',
      'owner.full_name AS owner_full_name',
      'owner.email AS owner_email',
      'snapshot.id AS snapshot_id',
      'snapshot.version_no AS snapshot_version_no',
      'snapshot.row_count AS snapshot_row_count',
      'snapshot.fetched_at AS snapshot_fetched_at',
      'snapshot.sync_status AS snapshot_sync_status',
      'permission.created_at AS shared_at',
    ];
  }

  private async countSharedViews(
    queryBuilder: SelectQueryBuilder<ViewPermission>,
  ) {
    const countRow = await queryBuilder
      .clone()
      .select('COUNT(DISTINCT permission.id)', 'total')
      .orderBy()
      .getRawOne<{ total: string | null }>();

    return Number(countRow?.total ?? 0);
  }

  private applySort(
    queryBuilder: SelectQueryBuilder<ViewPermission>,
    sort?: ViewerViewsSortEnum,
  ) {
    switch (sort ?? ViewerViewsSortEnum.LATEST) {
      case ViewerViewsSortEnum.UPDATED_DESC:
        return queryBuilder
          .orderBy('snapshot.fetched_at', 'DESC', 'NULLS LAST')
          .addOrderBy('permission.created_at', 'DESC');
      case ViewerViewsSortEnum.NAME_ASC:
        return queryBuilder
          .orderBy('LOWER(view.name)', 'ASC')
          .addOrderBy('permission.created_at', 'DESC');
      case ViewerViewsSortEnum.NAME_DESC:
        return queryBuilder
          .orderBy('LOWER(view.name)', 'DESC')
          .addOrderBy('permission.created_at', 'DESC');
      case ViewerViewsSortEnum.LATEST:
      default:
        return queryBuilder.orderBy('permission.created_at', 'DESC');
    }
  }

  private toSharedViewResponse(
    row: SharedViewRow,
    includeSnapshotDetails: boolean,
  ) {
    const snapshot = row.snapshot_id
      ? {
          id: row.snapshot_id,
          ...(includeSnapshotDetails
            ? {
                versionNo: Number(row.snapshot_version_no ?? 0),
                rowCount: Number(row.snapshot_row_count ?? 0),
                fetchedAt: row.snapshot_fetched_at,
                syncStatus: row.snapshot_sync_status,
              }
            : {
                rowCount: Number(row.snapshot_row_count ?? 0),
                fetchedAt: row.snapshot_fetched_at,
              }),
        }
      : null;

    return {
      id: row.view_id,
      name: row.view_name,
      slug: row.view_slug,
      accessMode: row.view_access_mode,
      permissionType: row.permission_type,
      owner: {
        id: row.owner_id,
        fullName: row.owner_full_name,
        email: row.owner_email,
      },
      snapshot,
      sharedAt: row.shared_at,
      url: `/v/${row.view_slug}`,
    };
  }

  private resolvePagination(page?: number, limit?: number) {
    const parsedPage = Number(page ?? 1);
    const parsedLimit = Number(limit ?? 10);

    const safePage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const safeLimit =
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, 100)
        : 10;

    return {
      page: safePage,
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    };
  }
}
