import { IsInt, IsNumber, IsString, Min } from 'class-validator'

export class CreateCourtDto {

    @IsString()
    name: string;

    @IsInt()
    @Min(1)
    venueId: number;

    @IsNumber()
    pricePerBooking: number;



}