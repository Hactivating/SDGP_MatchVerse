import { IsEmail, IsInt, IsString, Max, Min } from 'class-validator';

export class RateVenueDto {
  @IsInt()
  userId: number;
  @IsInt()
  rating: number;
}
