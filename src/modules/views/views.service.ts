import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateViewDto } from './dto/create-view.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource as TypeOrmDataSource,
  EntityManager,
  IsNull,
  QueryFailedError,
} from 'typeorm';
import { View } from './entities/view.entity';
import { SelectionTypeEnum, ViewStatusEnum } from '../../common/enums/database.enums';
import { DataSource as DataSourceEntity } from '../data-sources/entities/data-source.entity';
import { SourceSheet } from '../source-sheets/entities/source-sheet.entity';
import { createBaseSlug } from './utils/slug.util';
import { validateRangeA1Notation } from '../data-sources/utils/sheet-range.util';

@Injectable()
export class ViewsService {
  constructor(
    @InjectDataSource()
    private readonly typeOrmDataSource: TypeOrmDataSource,
  ) {}

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

  findAll() {
    return `This action returns all views`;
  }

  findOne(id: number) {
    return `This action returns a #${id} view`;
  }

  update(id: number, updateViewDto: UpdateViewDto) {
    return `This action updates a #${id} view`;
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

  private async generateUniqueSlug(manager: EntityManager, viewName: string) {
    const baseSlug = createBaseSlug(viewName);
    let suffix = 1;

    while (suffix <= 1000) {
      const candidate = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
      const existed = await manager
        .createQueryBuilder(View, 'view')
        .where('LOWER(view.slug) = LOWER(:slug)', { slug: candidate })
        .andWhere('view.deleted_at IS NULL')
        .getExists();

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
}
