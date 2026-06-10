import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
import { comparePasswordHelper } from '../helpers/utils';
import { JwtService } from '@nestjs/jwt';
import { User } from '../modules/users/entities/user.entity';
import {
  CheckCodeDto,
  CreateAuthDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    const isValidPassword = await comparePasswordHelper(
      pass,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return user;
  }

  async logIn(user: User): Promise<any> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async handleRegister(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }

  async checkCode(checkCodeDto: CheckCodeDto) {
    return await this.usersService.checkCode(checkCodeDto);
  }

  async retryActivation(email: { email: string }) {
    return await this.usersService.retryActivation(email);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    return await this.usersService.forgotPassword(forgotPasswordDto);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    return await this.usersService.resetPassword(resetPasswordDto);
  }
}
