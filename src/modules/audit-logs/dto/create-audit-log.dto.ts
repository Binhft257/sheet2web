import { IsIP, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsString()
  actionType!: string;

  @IsString()
  targetType!: string;

  @IsOptional()
  @IsUUID()
  targetId?: string;

  @IsOptional()
  @IsObject()
  payloadJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  requestId?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;
}
