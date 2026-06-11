import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserStatusEnum } from '../../../common/enums/database.enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'owner@example.com',
    description: 'Địa chỉ email của người dùng.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    description: 'Mật khẩu do client gửi lên.',
  })
  @IsNotEmpty()
  @IsString()
  passwordHash!: string;

  @ApiProperty({
    example: 'Nguyen Van A',
    description: 'Họ tên hiển thị của người dùng.',
  })
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({
    enum: UserStatusEnum,
    example: UserStatusEnum.ACTIVE,
    description: 'Trạng thái ban đầu của người dùng.',
  })
  @IsOptional()
  @IsEnum(UserStatusEnum)
  status?: UserStatusEnum;
}
