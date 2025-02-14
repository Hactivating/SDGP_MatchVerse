import { IsDateString, IsInt, IsString } from 'class-validator';

export class VenueBookingDto {
  @IsInt()
  courtId: number;
  @IsString()
  startingTime: string;
  @IsDateString()
  date: string;
}
