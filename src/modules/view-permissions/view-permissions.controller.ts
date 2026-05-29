import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ViewPermissionsService } from './view-permissions.service';
import { CreateViewPermissionDto } from './dto/create-view-permission.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('views/:viewId/permissions')
@UseGuards(JwtAuthGuard)
export class ViewPermissionsController {
  constructor(
    private readonly viewPermissionsService: ViewPermissionsService,
  ) {}

  @Post()
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    viewId: string,
    @Body() createViewPermissionDto: CreateViewPermissionDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewPermissionsService.create(
      userId,
      viewId,
      createViewPermissionDto,
    );
  }

  @Get()
  findAll(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    viewId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewPermissionsService.findAll(userId, viewId);
  }

  @Delete(':permissionId')
  remove(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    viewId: string,
    @Param(
      'permissionId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang permission id'),
      }),
    )
    permissionId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewPermissionsService.remove(userId, viewId, permissionId);
  }
}
