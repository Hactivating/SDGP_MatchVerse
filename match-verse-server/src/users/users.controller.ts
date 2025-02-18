import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  getAllVenues() {
    return this.usersService.getAllUsers();
  }

  //Create A New Venue
  @Post()
  createNewVenue(@Body() payload: CreateUserDto) {
    return this.usersService.createNewUser(payload);
  }
  //Update existing venue by passing in Id and update details
  @Put(':id')
  updateVenue(@Param('id') id: string, @Body() payload: UpdateUserDto) {
    return this.usersService.updateUser(parseInt(id, 10), payload);
  }
  //Delete existing venue by passing in id
  @Delete(':id')
  deleteVenue(@Param('id') id: string) {
    return this.usersService.deleteUser(parseInt(id, 10));
  }
}
