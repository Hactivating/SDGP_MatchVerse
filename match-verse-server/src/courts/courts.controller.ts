import { Controller, Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CourtsService, } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';


@Controller('courts')
export class CourtsController {

    constructor(private courtsService: CourtsService) { }

    @Get()
    getAllCourts() {
        return this.courtsService.getAllCourts();

    }

    @Get('



}
