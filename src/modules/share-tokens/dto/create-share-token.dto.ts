import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateShareTokenDto {
  @ApiPropertyOptional({
    example: 'Client review link',
    description: 'Tên dễ đọc của share token.',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    nullable: true,
    description: 'Thời điểm hết hạn của share token.',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string | null;
}
