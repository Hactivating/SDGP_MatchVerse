import { IsDateString, IsInt, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  courtId: number;
  @IsString()
  startingTime: string;
  @IsDateString()
  date: string;
}
