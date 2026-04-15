import { PartialType } from '@nestjs/mapped-types';
import { CreateViewPermissionDto } from './create-view-permission.dto';

export class UpdateViewPermissionDto extends PartialType(CreateViewPermissionDto) {}
