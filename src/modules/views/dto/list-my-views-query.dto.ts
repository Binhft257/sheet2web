import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { AccessModeEnum, ViewStatusEnum } from '../../../common/enums/database.enums';

export class ListMyViewsQueryDto {
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
  @IsEnum(ViewStatusEnum)
  status?: ViewStatusEnum;

  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;
}
