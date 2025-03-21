import { IsNumber, IsString, IsOptional, IsNotEmpty } from "class-validator";

export class createPaymentDto {

    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    courtId: number;

    @IsNotEmpty()
    date: string;

    @IsNotEmpty()
    @IsString()
    timeSlot: string;

    @IsNotEmpty()
    @IsNumber()
    venueFee: number;
}