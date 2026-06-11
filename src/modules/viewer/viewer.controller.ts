import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { ListViewerViewsQueryDto } from './dto/list-viewer-views-query.dto';
import { ViewerService } from './viewer.service';

@ApiTags('Người xem')
@ApiBearerAuth()
@Controller('viewer')
@UseGuards(JwtAuthGuard)
export class ViewerController {
  constructor(private readonly viewerService: ViewerService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Lấy dashboard người xem',
    description: 'Trả về dữ liệu dashboard của người xem đang đăng nhập.',
  })
  @ApiOkResponse({ description: 'Trả về dashboard người xem thành công.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  getDashboard(@Req() req: Request & { user?: { id?: string } }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.viewerService.getDashboard(userId);
  }

  @Get('views')
  @ApiOperation({
    summary: 'Danh sách view của người xem',
    description:
      'Trả về danh sách view có phân trang mà người xem đang đăng nhập có thể truy cập.',
  })
  @ApiOkResponse({
    description: 'Trả về danh sách view của người xem thành công.',
  })
  @ApiBadRequestResponse({ description: 'Tham số truy vấn không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  listViews(
    @Req() req: Request & { user?: { id?: string } },
    @Query() listViewerViewsQueryDto: ListViewerViewsQueryDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.viewerService.listViews(userId, listViewerViewsQueryDto);
  }
}
