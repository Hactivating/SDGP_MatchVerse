import { CreateCourtDto } from './create-court.dto'
import { PartialType } from '@nestjs/mapped-types' //creating an update DTO from existing DTO by making all fields optional
//inherits from CreateCourtDto including validation rules

export class UpdateCourtDto extends PartialType(CreateCourtDto) { }
