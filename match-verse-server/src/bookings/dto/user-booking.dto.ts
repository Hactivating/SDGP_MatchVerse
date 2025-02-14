import { IsDateString, IsInt, IsString } from 'class-validator';

export class UserBookingDto {
  @IsInt()
  userId:number;
  @IsInt()
  courtId: number;
  @IsString()
  startingTime: string;
  @IsDateString()
  date: string;
}
