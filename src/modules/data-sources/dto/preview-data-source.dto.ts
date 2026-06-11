import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class PreviewDataSourceDto {
  @ApiProperty({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID source sheet cần xem trước.',
  })
  @IsUUID()
  sourceSheetId!: string;

  @ApiProperty({
    example: 'Sheet1!A1:D20',
    description: 'Vùng dữ liệu theo định dạng A1 cần xem trước.',
  })
  @IsString()
  rangeA1Notation!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Cho biết có dùng dòng đầu tiên làm tiêu đề cột hay không.',
  })
  @IsOptional()
  @IsBoolean()
  useFirstRowAsHeader?: boolean;
}
