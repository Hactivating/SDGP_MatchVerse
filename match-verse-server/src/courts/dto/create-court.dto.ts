import { IsInt, isInt, IsString, isString, Min } from 'class-validator'

export class CreateCourtDto {

    @IsString()
    name: String

    @IsInt()
    @Min(1)
    venueId: number



}