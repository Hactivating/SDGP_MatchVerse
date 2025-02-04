import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService:AuthService){}

    //validate user login details
    @Post()
    loginVenue(@Body() payload: LoginDto){
        return this.authService.loginVenue(payload);

    }
}
