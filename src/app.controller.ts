import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Trạng thái hệ thống')
@ApiBearerAuth()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái',
    description: 'Trả về phản hồi cơ bản của ứng dụng.',
  })
  @ApiOkResponse({ description: 'Ứng dụng phản hồi thành công.' })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai Bearer token.' })
  getHello(): string {
    return this.appService.getHello();
  }
}
