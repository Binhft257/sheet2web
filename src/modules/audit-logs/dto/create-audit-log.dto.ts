import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIP, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditLogDto {
  @ApiPropertyOptional({
    example: '9d1723de-1471-41b8-84f2-bcf9c0640c80',
    description: 'ID người dùng đã thực hiện hành động.',
  })
  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @ApiProperty({
    example: 'view.publish',
    description: 'Hành động được thực hiện.',
  })
  @IsString()
  actionType!: string;

  @ApiProperty({
    example: 'view',
    description: 'Loại tài nguyên bị tác động bởi hành động.',
  })
  @IsString()
  targetType!: string;

  @ApiPropertyOptional({
    example: '6a5ef874-243c-45fe-b293-39d550c05046',
    description: 'ID tài nguyên đích.',
  })
  @IsOptional()
  @IsUUID()
  targetId?: string;

  @ApiPropertyOptional({
    example: { before: 'draft', after: 'published' },
    description: 'Payload bổ sung của nhật ký audit.',
  })
  @IsOptional()
  @IsObject()
  payloadJson?: Record<string, any>;

  @ApiPropertyOptional({
    example: 'req_01HYZK9A2B',
    description: 'ID dùng để đối chiếu request.',
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({
    example: '127.0.0.1',
    description: 'Địa chỉ IP của client.',
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;
}
