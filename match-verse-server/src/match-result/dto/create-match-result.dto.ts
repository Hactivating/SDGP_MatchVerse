import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateMatchResultDto {
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    winner1Id: number;

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    winner2Id: number;
}