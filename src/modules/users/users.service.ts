import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { hashPassword } from '../../helpers/utils';
import { CheckCodeDto, CreateAuthDto } from '../../auth/dto/create-auth.dto';
import { UserStatusEnum } from '../../common/enums/database.enums';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}
  async checkEmailExists(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.passwordHash);
    createUserDto.passwordHash = hashedPassword;

    if (await this.checkEmailExists(createUserDto.email)) {
      throw new BadRequestException('Email already exists');
    }
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }
  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  findOne(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    this.usersRepository.update(id, updateUserDto);
    return this.usersRepository.findOneBy({ id });
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Không tìm thấy user');
    }

    user.deletedAt = new Date();
    return await this.usersRepository.save(user);
  }

  async handleRegister(registerDto: CreateAuthDto) {
    if (await this.checkEmailExists(registerDto.email)) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await hashPassword(registerDto.passwordHash);
    const codeId = uuidv4();
    const user = this.usersRepository.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      status: UserStatusEnum.INACTIVE,
      codeId: codeId,
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
      codeExpired: dayjs().add(5, 'minutes').toDate(),
    });

    const savedUser = await this.usersRepository.save(user);
    this.mailerService.sendMail({
      to: savedUser.email,
      subject: 'Activate your account',
      template: 'register.hbs',
      context: {
        name: savedUser?.fullName ?? savedUser.email,
        activationCode: codeId,
      },
    });

    return {
      id: savedUser.id,
      email: savedUser.email,
    };
  }

  async checkCode(checkCodeDto: CheckCodeDto) {
    const user = await this.usersRepository.findOneBy({
      id: checkCodeDto.id,
    });

    if (!user) {
      throw new NotFoundException('Invalid id');
    }

    if (!user.codeId || !user.codeExpired) {
      throw new BadRequestException(
        'Mã code không tồn tại, vui lòng đăng ký lại',
      );
    }

    if (user.status === UserStatusEnum.ACTIVE) {
      throw new BadRequestException('Tài khoan đã được kích hoạt trước đó');
    }

    if (user.codeId !== checkCodeDto.code) {
      throw new BadRequestException(
        'Mã code không đúng, vui lòng kiểm tra lại',
      );
    }

    if (dayjs().isAfter(dayjs(user.codeExpired))) {
      throw new BadRequestException(
        'Mã của bạn đã hết hạn, vui lòng đăng ký lại',
      );
    }

    user.status = UserStatusEnum.ACTIVE;
    user.codeId = null;
    user.codeExpired = null;

    await this.usersRepository.save(user);
    return {
      message: 'Verify account successfully',
    };
  }

  async retryActivation(body: { email: string }) {
    const user = await this.usersRepository.findOneBy({
      email: body.email,
    });

    // 1. Nếu không có user
    if (!user) {
      throw new BadRequestException('Email không tồn tại.');
    }

    // 2. Nếu user đã active rồi
    if (user.status === UserStatusEnum.ACTIVE) {
      throw new BadRequestException('Tài khoản đã được kích hoạt.');
    }

    // 3. Nếu user chưa active thì tạo code mới
    const code = uuidv4();

    const codeExpired = dayjs().add(5, 'minutes').toDate();

    // 4. Lưu code mới vào database
    user.codeId = code;
    user.codeExpired = codeExpired;

    await this.usersRepository.save(user);

    // 5. Gửi email chứa code mới
    this.mailerService.sendMail({
      to: user.email,
      subject: 'Activate your account',
      template: 'register.hbs',
      context: {
        name: user?.fullName ?? user.email,
        activationCode: code,
      },
    });

    // 6. Trả id về cho frontend
    return {
      id: user.id,
      email: user.email,
    };
  }
}
