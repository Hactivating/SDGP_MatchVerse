import { IsInt } from "class-validator";

export class JoinSinglesDto {
    @IsInt()
    matchId: number;

    @IsInt()
    userId: number;
}