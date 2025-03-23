import { IsBoolean, IsInt } from "class-validator";

export class AcceptMatchDto {
    @IsInt()
    requestId: number;

    @IsInt()
    userId: number;

    @IsBoolean()
    accepted: boolean;
}