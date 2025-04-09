import { IsEnum, IsInt, IsBoolean, IsOptional } from "class-validator";

export class JoinMatchDto {
    @IsInt()
    matchId: number;

    @IsInt()
    userId: number;

    @IsOptional()
    @IsInt()
    partnerId?: number;
}