import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ViewsService } from './views.service';
import { CreateViewDto } from './dto/create-view.dto';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.viewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateViewDto: UpdateViewDto) {
    return this.viewsService.update(+id, updateViewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.viewsService.remove(+id);
  }
}
