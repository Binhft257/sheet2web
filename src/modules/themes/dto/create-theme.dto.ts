import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ThemeScopeEnum } from '../../../common/enums/database.enums';

export class CreateThemeDto {
  @ApiPropertyOptional({
    example: '9d1723de-1471-41b8-84f2-bcf9c0640c80',
    description: 'ID người dùng sở hữu theme tùy chỉnh.',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({
    example: 'Clean Table',
    description: 'Tên hiển thị của theme.',
  })
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    enum: ThemeScopeEnum,
    example: ThemeScopeEnum.CUSTOM,
    description: 'Phạm vi áp dụng của theme.',
  })
  @IsOptional()
  @IsEnum(ThemeScopeEnum)
  scope?: ThemeScopeEnum;

  @ApiPropertyOptional({
    example: { primaryColor: '#2563eb', fontFamily: 'Inter' },
    description: 'JSON cấu hình theme.',
  })
  @IsOptional()
  @IsObject()
  configJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: '2026-06-10T10:00:00.000Z',
    description: 'Thời điểm xóa mềm.',
  })
  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
