import { IsInt, IsString, Min } from 'class-validator'

export class CreateCourtDto {

    @IsString()
    name: string

    @IsInt()
    @Min(1)
    venueId: number



}