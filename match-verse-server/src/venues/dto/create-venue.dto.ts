import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

export class CreateVenueDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  location: string;
  @IsInt()
  @Min(0)
  @Max(2359)
  openingTime: number;
  @Min(0)
  @Max(2359)
  closingTime: number;
}
