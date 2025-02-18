import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  username: string;
}
