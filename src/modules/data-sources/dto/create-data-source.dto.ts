import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDataSourceDto {
  @IsNotEmpty()
  @IsString()
  sourceUrl!: string;

  @IsOptional()
  @IsString()
  title?: string;
}
