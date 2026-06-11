import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateViewPermissionDto {
  @ApiProperty({
    example: 'viewer@example.com',
    description: 'Địa chỉ email được cấp quyền truy cập view.',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
