import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    //changes username field to accept the email field instead
    //allows access to the full request object in the validate() method 

    super({ usernameField: 'email',passReqToCallback:true });
  }

  async validate(req:Request,email: string, password: string) {
    //type is extracted from the req body
    const {type}=req.body;
    return await this.authService.validate(email, password,type);
  }
}
