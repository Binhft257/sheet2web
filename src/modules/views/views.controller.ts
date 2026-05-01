import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ViewsService } from './views.service';
import { CreateViewDto } from './dto/create-view.dto';
import { ListMyViewsQueryDto } from './dto/list-my-views-query.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';
import { Public } from '../../decorator/customize';
import { JwtService } from '@nestjs/jwt';

@Controller('views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Body() createViewDto: CreateViewDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.create(userId, createViewDto);
  }

  @Get()
  findAll() {
    return this.viewsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyViews(
    @Req() req: Request & { user?: { id?: string } },
    @Query() listMyViewsQueryDto: ListMyViewsQueryDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.listMy(userId, listMyViewsQueryDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.findOne(userId, id);
  }

  @Patch(':id/published')
  @UseGuards(JwtAuthGuard)
  updatePublished(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
    @Body() updateViewDto: UpdateViewDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.updatePublished(userId, id, updateViewDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
    @Body() updateViewDto: UpdateViewDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.update(userId, id, updateViewDto);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Khong xac dinh duoc nguoi dung dang nhap',
      );
    }

    return this.viewsService.publish(userId, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewsService.remove(+id);
  }
}

@Controller('v')
export class PublicViewsController {
  constructor(
    private readonly viewsService: ViewsService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Get(':slug')
  async findPublishedBySlug(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Query('shareToken') shareToken?: string,
  ) {
    const userId = await this.getOptionalUserId(req);
    return this.viewsService.findPublishedBySlug(slug, userId, shareToken);
  }

  private async getOptionalUserId(req: Request) {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    const accessToken = authorization.slice('Bearer '.length).trim();
    if (!accessToken) {
      return undefined;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: string }>(
        accessToken,
      );
      return payload.sub;
    } catch {
      return undefined;
    }
  }
}
