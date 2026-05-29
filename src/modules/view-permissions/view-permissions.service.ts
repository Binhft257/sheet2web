import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateViewPermissionDto } from './dto/create-view-permission.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource as TypeOrmDataSource, IsNull } from 'typeorm';
import { View } from '../views/entities/view.entity';
import { ViewPermission } from './entities/view-permission.entity';
import { User } from '../users/entities/user.entity';
import { PermissionTypeEnum } from '../../common/enums/database.enums';

@Injectable()
export class ViewPermissionsService {
  constructor(
    @InjectDataSource()
    private readonly typeOrmDataSource: TypeOrmDataSource,
  ) {}

  async create(
    userId: string,
    viewId: string,
    createViewPermissionDto: CreateViewPermissionDto,
  ) {
    const view = await this.findOwnedView(userId, viewId);
    const email = createViewPermissionDto.email.trim().toLowerCase();
    const targetUser = await this.typeOrmDataSource.manager
      .createQueryBuilder(User, 'targetUser')
      .where('LOWER(targetUser.email) = LOWER(:email)', { email })
      .andWhere('targetUser.deleted_at IS NULL')
      .getOne();

    if (!targetUser) {
      throw new NotFoundException('Khong tim thay user.');
    }

    if (targetUser.id === userId) {
      throw new BadRequestException('Owner khong can duoc cap quyen rieng.');
    }

    const existedPermission = await this.typeOrmDataSource.manager.findOne(
      ViewPermission,
      {
        where: {
          viewId: view.id,
          userId: targetUser.id,
        },
        relations: { user: true },
      },
    );

    if (existedPermission) {
      return this.toResponse(existedPermission);
    }

    const permission = this.typeOrmDataSource.manager.create(ViewPermission, {
      viewId: view.id,
      userId: targetUser.id,
      permissionType: PermissionTypeEnum.VIEW,
      grantedBy: userId,
    });

    const savedPermission = await this.typeOrmDataSource.manager.save(
      ViewPermission,
      permission,
    );
    savedPermission.user = targetUser;

    return this.toResponse(savedPermission);
  }

  async findAll(userId: string, viewId: string) {
    const view = await this.findOwnedView(userId, viewId);
    const permissions = await this.typeOrmDataSource.manager.find(
      ViewPermission,
      {
        where: { viewId: view.id },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      },
    );

    return {
      items: permissions.map((permission) => this.toResponse(permission)),
    };
  }

  async remove(userId: string, viewId: string, permissionId: string) {
    const view = await this.findOwnedView(userId, viewId);
    const permission = await this.typeOrmDataSource.manager.findOne(
      ViewPermission,
      {
        where: {
          id: permissionId,
          viewId: view.id,
        },
      },
    );

    if (!permission) {
      throw new NotFoundException('Khong tim thay permission.');
    }

    await this.typeOrmDataSource.manager.delete(ViewPermission, permission.id);

    return { success: true };
  }

  private async findOwnedView(userId: string, viewId: string) {
    const view = await this.typeOrmDataSource.manager.findOne(View, {
      where: { id: viewId, deletedAt: IsNull() },
    });

    if (!view) {
      throw new NotFoundException('Khong tim thay view.');
    }

    if (view.ownerId !== userId) {
      throw new ForbiddenException('Ban khong co quyen quan ly view nay.');
    }

    return view;
  }

  private toResponse(permission: ViewPermission) {
    return {
      id: permission.id,
      user: {
        id: permission.user.id,
        email: permission.user.email,
        name: permission.user.fullName,
      },
      role: 'viewer',
      createdAt: permission.createdAt,
    };
  }
}
