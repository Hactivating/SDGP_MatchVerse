import {
  Controller,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courts')
export class CourtsController {
  constructor(private courtsService: CourtsService) {}

  @Get()
  getAllCourts() {
    return this.courtsService.getAllCourts();
  }

  @Get(':id')
  getCourtById(@Param('id') id: string) {
    return this.courtsService.getCourtById(parseInt(id, 10));
  }

  @Post()
  createCourt(@Body() payload: CreateCourtDto) {
    return this.courtsService.createCourt(payload);
  }

  @Delete(':id')
  deleteCourt(@Param('id') id: string) {
    return this.courtsService.deleteCourt(parseInt(id, 10));
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/upload-file')
  async addImagesToCourt(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Request() req,
  ) {
    console.log(file);
    console.log('sdsd');
    await this.courtsService.addImagesToCourt(file, parseInt(id));
  }
}
