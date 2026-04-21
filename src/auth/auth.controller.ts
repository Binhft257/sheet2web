import {
  Request,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from '../decorator/customize';
import { CreateAuthDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    return this.authService.logIn(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: CreateAuthDto) {
    return await this.authService.handleRegister(registerDto);
  }

  @Public()
  @Get('mail')
  async testMain() {
    await this.mailerService.sendMail({
      to: 'binhnguyen2572005@gmail.com',
      subject: 'Welcome!',
      text: 'welcome',
      html: '<b>hello world </b>',
    });
    return 'ok';
  }
}
