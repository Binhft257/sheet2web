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
import { CheckCodeDto, CreateAuthDto } from './dto/create-auth.dto';
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
  @Post('check-code')
  async checkCode(@Body() checkCodeDto: CheckCodeDto) {
    return await this.authService.checkCode(checkCodeDto);
  }

  @Public()
  @Post('retry-active')
  async retryActivation(@Body() email: { email: string }) {
    return await this.authService.retryActivation(email);
  }

  @Public()
  @Get('mail')
  async testMain() {
    await this.mailerService.sendMail({
      to: 'binhnguyen2572005@gmail.com',
      subject: 'Welcome!',
      text: 'welcome',
      template: 'register.hbs',
      context: {
        name: 'Binh',
        activationCode: 123456789,
      },
    });
    return 'ok';
  }
}
