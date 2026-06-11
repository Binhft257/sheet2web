import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({ example: 1, description: 'Số trang.', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Số view được chia sẻ trên mỗi trang.',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'sales',
    description: 'Từ khóa tìm kiếm view của người xem.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: AccessModeEnum,
    example: AccessModeEnum.PUBLIC,
    description: 'Lọc theo chế độ truy cập.',
  })
  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;

  @ApiPropertyOptional({
    enum: ViewerViewsSortEnum,
    example: ViewerViewsSortEnum.LATEST,
    description: 'Thứ tự sắp xếp view của người xem.',
  })
  @IsOptional()
  @IsEnum(ViewerViewsSortEnum)
  sort?: ViewerViewsSortEnum;
}
