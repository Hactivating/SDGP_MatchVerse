import { IsEnum, IsInt, IsOptional } from "class-validator";

export class CreateMatchRequestDto {


    @IsOptional()
    @IsInt()
    bookingId?: number;

    @IsEnum(['single', 'double'])
    matchType: 'single' | 'double'

    @IsInt()
    createdById: number;

    @IsOptional()
    @IsInt()
    partnerId?: number;

}