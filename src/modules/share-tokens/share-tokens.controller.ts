import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ShareTokensService } from './share-tokens.service';
import { CreateShareTokenDto } from './dto/create-share-token.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@ApiTags('Share token')
@ApiBearerAuth()
@Controller('views/:viewId/share-tokens')
@UseGuards(JwtAuthGuard)
export class ShareTokensController {
  constructor(private readonly shareTokensService: ShareTokensService) {}

  @Post()
  @ApiOperation({
    summary: 'Tạo share token',
    description: 'Tạo share token cho view thuộc người dùng đang đăng nhập.',
  })
  @ApiParam({ name: 'viewId', description: 'UUID của view.', format: 'uuid' })
  @ApiBody({ type: CreateShareTokenDto })
  @ApiCreatedResponse({ description: 'Tạo share token thành công.' })
  @ApiBadRequestResponse({
    description: 'ID view hoặc dữ liệu gửi lên không hợp lệ.',
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy view.' })
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng view id'),
      }),
    )
    viewId: string,
    @Body() createShareTokenDto: CreateShareTokenDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.shareTokensService.create(userId, viewId, createShareTokenDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Danh sách share token',
    description:
      'Danh sách share token for a view owned by the authenticated user.',
  })
  @ApiParam({ name: 'viewId', description: 'UUID của view.', format: 'uuid' })
  @ApiOkResponse({ description: 'Trả về danh sách share token thành công.' })
  @ApiBadRequestResponse({ description: 'ID view không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy view.' })
  findAll(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng view id'),
      }),
    )
    viewId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.shareTokensService.findAll(userId, viewId);
  }

  @Patch(':tokenId/revoke')
  @ApiOperation({
    summary: 'Thu hồi share token',
    description:
      'Thu hồi share token đang hoạt động của view thuộc người dùng đang đăng nhập.',
  })
  @ApiParam({ name: 'viewId', description: 'UUID của view.', format: 'uuid' })
  @ApiParam({
    name: 'tokenId',
    description: 'UUID của share token.',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Thu hồi share token thành công.' })
  @ApiBadRequestResponse({
    description: 'ID view hoặc ID share token không hợp lệ.',
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy view hoặc share token.' })
  revoke(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'viewId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng view id'),
      }),
    )
    viewId: string,
    @Param(
      'tokenId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng share token id'),
      }),
    )
    tokenId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.shareTokensService.revoke(userId, viewId, tokenId);
  }
}
