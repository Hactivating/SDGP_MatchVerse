import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { VenuesService } from 'src/venues/venues.service';
import * as bcryt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private venuesService: VenuesService){}

    async loginVenue(payload: LoginDto){
        // get relevant details of the entered email
        const venue= await this.venuesService.getVenueByEmail(payload.email);
        //check if passwords match
        const authorized= await bcryt.compare(payload.password,venue.password);
    
        if(authorized){
            return venue; //return details if passwords match
        }
        else{
            //throw exception if password dont match
            throw new UnauthorizedException("Wrong password");
        }

    }
}
