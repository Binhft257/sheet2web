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
import { CreateAuthDto } from '../../auth/dto/create-auth.dto';
import { UserStatusEnum } from '../../common/enums/database.enums';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    const user = this.usersRepository.create({
      email: registerDto.email,
      passwordHash: hashedPassword,
      fullName: registerDto.fullName,
      status: UserStatusEnum.INACTIVE,
      codeId: uuidv4(),
      codeExpired: dayjs().add(1, 'day').toDate(),
    });

    const savedUser = await this.usersRepository.save(user);

    return {
      id: savedUser.id,
    };
  }
}
