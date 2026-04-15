import { Injectable } from '@nestjs/common';
import { CreateViewPermissionDto } from './dto/create-view-permission.dto';
import { UpdateViewPermissionDto } from './dto/update-view-permission.dto';

@Injectable()
export class ViewPermissionsService {
  create(createViewPermissionDto: CreateViewPermissionDto) {
    return 'This action adds a new viewPermission';
  }

  findAll() {
    return `This action returns all viewPermissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} viewPermission`;
  }

  update(id: number, updateViewPermissionDto: UpdateViewPermissionDto) {
    return `This action updates a #${id} viewPermission`;
  }

  remove(id: number) {
    return `This action removes a #${id} viewPermission`;
  }
}
