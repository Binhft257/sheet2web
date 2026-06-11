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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { DataSourcesService } from './data-sources.service';
import { CreateDataSourceDto } from './dto/create-data-source.dto';
import { UpdateDataSourceDto } from './dto/update-data-source.dto';
import { PreviewDataSourceDto } from './dto/preview-data-source.dto';
import { ListDataSourcesQueryDto } from './dto/list-data-sources-query.dto';
import { JwtAuthGuard } from '../../auth/passport/jwt-auth.guard';

@ApiTags('Nguồn dữ liệu')
@Controller('data-sources')
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Danh sách nguồn dữ liệu của tôi',
    description:
      'Trả về danh sách nguồn dữ liệu có phân trang của người dùng đang đăng nhập.',
  })
  @ApiOkResponse({ description: 'Trả về danh sách nguồn dữ liệu thành công.' })
  @ApiBadRequestResponse({ description: 'Tham số truy vấn không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  findMyDataSources(
    @Req() req: Request & { user?: { id?: string } },
    @Query() listDataSourcesQueryDto: ListDataSourcesQueryDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.list(userId, listDataSourcesQueryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tạo nguồn dữ liệu',
    description:
      'Kết nối Google Sheet làm nguồn dữ liệu mới cho người dùng đang đăng nhập.',
  })
  @ApiBody({ type: CreateDataSourceDto })
  @ApiCreatedResponse({ description: 'Tạo nguồn dữ liệu thành công.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu nguồn dữ liệu không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  create(
    @Req() req: Request & { user?: { id?: string } },
    @Body() createDataSourceDto: CreateDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.create(userId, createDataSourceDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cập nhật nguồn dữ liệu',
    description:
      'Cập nhật nguồn dữ liệu hiện có thuộc người dùng đang đăng nhập.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của nguồn dữ liệu.',
    format: 'uuid',
  })
  @ApiBody({ type: UpdateDataSourceDto })
  @ApiOkResponse({ description: 'Cập nhật nguồn dữ liệu thành công.' })
  @ApiBadRequestResponse({
    description: 'ID hoặc dữ liệu gửi lên không hợp lệ.',
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nguồn dữ liệu.' })
  update(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng data source id'),
      }),
    )
    id: string,
    @Body() updateDataSourceDto: UpdateDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.update(userId, id, updateDataSourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xóa nguồn dữ liệu',
    description: 'Xóa nguồn dữ liệu hiện có thuộc người dùng đang đăng nhập.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của nguồn dữ liệu.',
    format: 'uuid',
  })
  @ApiNoContentResponse({ description: 'Xóa nguồn dữ liệu thành công.' })
  @ApiOkResponse({ description: 'Trả về kết quả xóa thành công.' })
  @ApiBadRequestResponse({ description: 'ID nguồn dữ liệu không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nguồn dữ liệu.' })
  remove(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng data source id'),
      }),
    )
    id: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.remove(userId, id);
  }

  @Get(':id/sheets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Danh sách source sheet',
    description:
      'Liệt kê các sheet đã phát hiện trong nguồn dữ liệu đã kết nối.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của nguồn dữ liệu.',
    format: 'uuid',
  })
  @ApiOkResponse({ description: 'Trả về danh sách source sheet thành công.' })
  @ApiBadRequestResponse({ description: 'ID nguồn dữ liệu không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nguồn dữ liệu.' })
  listSheets(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng data source id'),
      }),
    )
    id: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.listSheets(userId, id);
  }

  @Post(':id/preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xem trước vùng dữ liệu',
    description: 'Xem trước các dòng dữ liệu trong sheet và vùng A1 đã chọn.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID của nguồn dữ liệu.',
    format: 'uuid',
  })
  @ApiBody({ type: PreviewDataSourceDto })
  @ApiOkResponse({ description: 'Trả về dữ liệu xem trước thành công.' })
  @ApiBadRequestResponse({
    description: 'ID hoặc dữ liệu xem trước không hợp lệ.',
  })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({
    description: 'Không tìm thấy nguồn dữ liệu hoặc sheet.',
  })
  preview(
    @Req() req: Request & { user?: { id?: string } },
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () =>
          new BadRequestException('Sai định dạng data source id'),
      }),
    )
    id: string,
    @Body() previewDataSourceDto: PreviewDataSourceDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.dataSourcesService.preview(userId, id, previewDataSourceDto);
  }
}
