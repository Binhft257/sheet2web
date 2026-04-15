import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import {
  TokenStatusEnum,
  TokenTypeEnum,
} from '../../../common/enums/database.enums';

export class CreateShareTokenDto {
  @IsUUID()
  viewId!: string;

  @IsString()
  tokenHash!: string;

  @IsOptional()
  @IsString()
  tokenPreview?: string;

  @IsOptional()
  @IsEnum(TokenTypeEnum)
  tokenType?: TokenTypeEnum;

  @IsOptional()
  @IsEnum(TokenStatusEnum)
  status?: TokenStatusEnum;

  @IsOptional()
  @IsUUID()
  invitedUserId?: string;

  @IsOptional()
  @IsEmail()
  recipientEmail?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  usedCount?: number;

  @IsOptional()
  @IsDateString()
  lastUsedAt?: string;

  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @IsOptional()
  @IsObject()
  metadataJson?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  revokedAt?: string;
}
