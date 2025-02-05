import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { VenuesService } from 'src/venues/venues.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private venuesService: VenuesService){}

    async validateVenue(email:string,password:string){
        // get relevant details of the entered email
        const venue= await this.venuesService.getVenueByEmail(email);
        //check if passwords match
        const authorized= await bcrypt.compare(password,venue.password);
    
        if(authorized){
            return venue.id; //return details if passwords match
        }
        else{
            //throw exception if password dont match
            throw new UnauthorizedException("Wrong password");
        }

    }
}
