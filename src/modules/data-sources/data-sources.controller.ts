import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PreviewDataSourceDto } from './dto/preview-data-source.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Body() createDataSourceDto: CreateDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
    }

    return this.dataSourcesService.create(userId, createDataSourceDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang data source id'),
      }),
    )
    id: string,
    @Body() updateDataSourceDto: UpdateDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
    }

    return this.dataSourcesService.update(userId, id, updateDataSourceDto);
  }

  @Post(':id/preview')
  @UseGuards(JwtAuthGuard)
  preview(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai dinh dang data source id'),
      }),
    )
    id: string,
    @Body() previewDataSourceDto: PreviewDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Khong xac dinh duoc nguoi dung dang nhap');
    }

    return this.dataSourcesService.preview(userId, id, previewDataSourceDto);
  }
}
