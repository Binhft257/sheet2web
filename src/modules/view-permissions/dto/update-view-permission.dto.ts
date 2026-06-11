import { PartialType } from '@nestjs/swagger';
import { CreateViewPermissionDto } from './create-view-permission.dto';

export class UpdateViewPermissionDto extends PartialType(
  CreateViewPermissionDto,
) {}
