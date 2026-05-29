import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { ListViewerViewsQueryDto } from './dto/list-viewer-views-query.dto';
import { ViewerService } from './viewer.service';

@Controller('viewer')
@UseGuards(JwtAuthGuard)
export class ViewerController {
  constructor(private readonly viewerService: ViewerService) {}

  @Get('dashboard')
  getDashboard(@Req() req: Request & { user?: { id?: string } }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewerService.getDashboard(userId);
  }

  @Get('views')
  listViews(
    @Req() req: Request & { user?: { id?: string } },
    @Query() listViewerViewsQueryDto: ListViewerViewsQueryDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewerService.listViews(userId, listViewerViewsQueryDto);
  }
}
