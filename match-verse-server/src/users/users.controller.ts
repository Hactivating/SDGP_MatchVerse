import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  //Create A New Venue
  @Post()
  createNewUser(@Body() payload: CreateUserDto) {
    return this.usersService.createNewUser(payload);
  }
  //Update existing venue by passing in Id and update details
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(parseInt(id, 10), payload);
  }
  //Delete existing venue by passing in id
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(parseInt(id, 10));
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':id/upload-file')
  async addImageToUser(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Request() req,
  ) {
    console.log(file);
    return this.usersService.addImageToVenue(file, parseInt(id));
  }
}
