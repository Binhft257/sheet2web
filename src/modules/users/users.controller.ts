import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
  Req,
  UnauthorizedException,
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
import type { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../decorator/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Người dùng')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Tạo người dùng',
    description: 'Tạo trực tiếp một tài khoản người dùng. Chỉ admin được phép.',
  })
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: 'Tạo người dùng thành công.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu người dùng không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Danh sách người dùng',
    description:
      'Trả về toàn bộ người dùng. Chỉ admin được phép.',
  })
  @ApiOkResponse({ description: 'Trả về danh sách người dùng thành công.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy hồ sơ của tôi',
    description: 'Trả về thông tin hồ sơ của người dùng đang đăng nhập.',
  })
  @ApiOkResponse({ description: 'Trả về hồ sơ thành công.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  findMe(@Req() req: Request & { user?: { id?: string } }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'Không xác định được người dùng đang đăng nhập',
      );
    }

    return this.usersService.findProfile(userId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy người dùng theo ID',
    description: 'Trả về một người dùng theo ID. Chỉ admin được phép.',
  })
  @ApiParam({ name: 'id', description: 'ID người dùng.' })
  @ApiOkResponse({ description: 'Trả về người dùng thành công.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng.' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cập nhật người dùng',
    description: 'Cập nhật người dùng theo ID. Chỉ admin được phép.',
  })
  @ApiParam({ name: 'id', description: 'ID người dùng.' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'Cập nhật người dùng thành công.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu người dùng không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xóa người dùng',
    description: 'Xóa người dùng theo UUID. Chỉ admin được phép.',
  })
  @ApiParam({ name: 'id', description: 'UUID của người dùng.', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Xóa người dùng thành công.' })
  @ApiOkResponse({ description: 'Trả về kết quả xóa thành công.' })
  @ApiBadRequestResponse({ description: 'ID người dùng không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng.' })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        exceptionFactory: () => new BadRequestException('Sai định dạng id'),
      }),
    )
    id: string,
  ) {
    return this.usersService.remove(id);
  }
}
