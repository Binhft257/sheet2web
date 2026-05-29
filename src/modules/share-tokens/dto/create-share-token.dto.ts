import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateShareTokenDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
