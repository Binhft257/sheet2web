import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PermissionTypeEnum } from '../../../common/enums/database.enums';

export class CreateViewPermissionDto {
  @IsUUID()
  viewId!: string;

  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsEnum(PermissionTypeEnum)
  permissionType?: PermissionTypeEnum;

  @IsOptional()
  @IsUUID()
  grantedBy?: string;
}
