import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateViewPermissionDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
