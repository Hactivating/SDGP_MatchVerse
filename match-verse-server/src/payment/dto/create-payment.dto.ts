import { IsNumber, IsString, IsOptional, IsNotEmpty, isNumber } from "class-validator";

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
    @IsNumber()
    timeSlot: string;

    @IsNotEmpty()
    @IsNumber()
    venueFee: number;
}