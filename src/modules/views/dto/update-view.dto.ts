import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  AccessModeEnum,
  SelectionTypeEnum,
} from '../../../common/enums/database.enums';

export class UpdateViewDto {
  @ApiPropertyOptional({
    example: 'Public Sales Dashboard',
    description: 'Tên hiển thị của view.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    nullable: true,
    description: 'ID source sheet đã chọn.',
  })
  @IsOptional()
  @IsUUID()
  sourceSheetId?: string | null;

  @ApiPropertyOptional({
    enum: SelectionTypeEnum,
    example: SelectionTypeEnum.RANGE,
    description: 'Chế độ chọn dữ liệu của view.',
  })
  @IsOptional()
  @IsEnum(SelectionTypeEnum)
  selectionType?: SelectionTypeEnum;

  @ApiPropertyOptional({
    example: 'Sheet1!A1:F100',
    nullable: true,
    description: 'Vùng theo định dạng A1 cho kiểu chọn range.',
  })
  @IsOptional()
  @IsString()
  rangeA1Notation?: string | null;

  @ApiPropertyOptional({
    enum: AccessModeEnum,
    example: AccessModeEnum.PUBLIC,
    description: 'Chế độ truy cập của view.',
  })
  @IsOptional()
  @IsEnum(AccessModeEnum)
  accessMode?: AccessModeEnum;

  @ApiPropertyOptional({
    example: true,
    description: 'Cho biết có dùng dòng đầu tiên làm header hay không.',
  })
  @IsOptional()
  @IsBoolean()
  useFirstRowAsHeader?: boolean;

  @ApiPropertyOptional({
    example: 300,
    description: 'Khoảng thời gian làm mới tính bằng giây.',
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  refreshIntervalSeconds?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Cho biết người xem có thể đổi theme hay không.',
  })
  @IsOptional()
  @IsBoolean()
  allowThemeSwitch?: boolean;

  @ApiPropertyOptional({
    example: 'a8d3de9e-32db-412e-a653-8c24d2d46f24',
    nullable: true,
    description: 'ID theme được áp dụng cho view.',
  })
  @IsOptional()
  @IsUUID()
  themeId?: string | null;

  @ApiPropertyOptional({
    example: { primaryColor: '#2563eb' },
    description: 'JSON ghi đè theme.',
  })
  @IsOptional()
  @IsObject()
  themeOverrideJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: { showFilters: true },
    description: 'JSON cấu hình view.',
  })
  @IsOptional()
  @IsObject()
  settingsJson?: Record<string, any>;
}
