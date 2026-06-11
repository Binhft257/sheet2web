import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'passwordHash',
    });
  }

  async validate(email: string, passwordHash: string): Promise<any> {
    const user = await this.authService.validateUser(email, passwordHash);
    if (user.status === 'inactive') {
      throw new BadRequestException('Tài khoản chưa được kích hoạt');
    }
    return user;
  }
}
