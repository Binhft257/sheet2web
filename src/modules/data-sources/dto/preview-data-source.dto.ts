import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class PreviewDataSourceDto {
  @IsUUID()
  sourceSheetId!: string;

  @IsString()
  rangeA1Notation!: string;

  @IsOptional()
  @IsBoolean()
  useFirstRowAsHeader?: boolean;
}
