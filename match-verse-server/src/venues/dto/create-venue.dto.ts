import { IsEmail, IsString } from 'class-validator';

export class CreateVenueDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  location: string;
}
