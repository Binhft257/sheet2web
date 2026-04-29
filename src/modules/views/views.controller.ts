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
import { Request } from 'express';
import { ViewsService } from './views.service';
import { CreateViewDto } from './dto/create-view.dto';
import { ListMyViewsQueryDto } from './dto/list-my-views-query.dto';
import { UpdateViewDto } from './dto/update-view.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

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
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
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
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
    }

    return this.viewsService.listMy(userId, listMyViewsQueryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
    @Body() updateViewDto: UpdateViewDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
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
        exceptionFactory: () => new BadRequestException('Sai dinh dang view id'),
      }),
    )
    id: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
    }

    return this.viewsService.publish(userId, id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewsService.remove(+id);
  }
}
