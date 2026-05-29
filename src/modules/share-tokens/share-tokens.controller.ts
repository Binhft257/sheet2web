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
import type { Request } from 'express';
import { ShareTokensService } from './share-tokens.service';
import { CreateShareTokenDto } from './dto/create-share-token.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('views/:viewId/share-tokens')
@UseGuards(JwtAuthGuard)
export class ShareTokensController {
  constructor(private readonly shareTokensService: ShareTokensService) {}

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
    @Body() createShareTokenDto: CreateShareTokenDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.shareTokensService.create(userId, viewId, createShareTokenDto);
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

    return this.shareTokensService.findAll(userId, viewId);
  }

  @Patch(':tokenId/revoke')
  revoke(
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
      'tokenId',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang share token id'),
      }),
    )
    tokenId: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.shareTokensService.revoke(userId, viewId, tokenId);
  }
}
