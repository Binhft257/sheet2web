import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({
    example: 'owner@example.com',
    description: 'Địa chỉ email dùng cho tài khoản.',
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
}

export class CheckCodeDto {
  @ApiProperty({
    example: '4f9d9f28-0f74-4d26-a860-56e9b82cb129',
    description: 'ID người dùng hoặc ID đối tượng cần xác minh.',
  })
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã xác minh đã gửi cho người dùng.',
  })
  @IsNotEmpty({ message: 'Code is required' })
  code!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'owner@example.com',
    description: 'Địa chỉ email sẽ nhận hướng dẫn đặt lại mật khẩu.',
  })
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: '4f9d9f28-0f74-4d26-a860-56e9b82cb129',
    description: 'ID người dùng hoặc ID đối tượng cần đặt lại mật khẩu.',
  })
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;

  @ApiProperty({
    example: '123456',
    description: 'Mã xác minh để đặt lại mật khẩu.',
  })
  @IsNotEmpty({ message: 'Code is required' })
  code!: string;

  @ApiProperty({
    example: 'N3wP@ssw0rd',
    description: 'Mật khẩu mới do client gửi lên.',
  })
  @IsNotEmpty()
  @IsString()
  passwordHash!: string;
}
