import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { SourceStatusEnum } from '../../../common/enums/database.enums';

export class ListDataSourcesQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Số trang dùng cho phân trang.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Số nguồn dữ liệu trên mỗi trang.',
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
    description: 'Từ khóa tìm kiếm để lọc nguồn dữ liệu.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: SourceStatusEnum,
    example: SourceStatusEnum.ACTIVE,
    description: 'Lọc nguồn dữ liệu theo trạng thái kết nối.',
  })
  @IsOptional()
  @IsEnum(SourceStatusEnum)
  status?: SourceStatusEnum;
}
