import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AccessModeEnum } from '../../../common/enums/database.enums';

export enum ViewerViewsSortEnum {
  LATEST = 'latest',
  UPDATED_DESC = 'updated_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export class ListViewerViewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;

  @IsOptional()
  @IsEnum(ViewerViewsSortEnum)
  sort?: ViewerViewsSortEnum;
}
