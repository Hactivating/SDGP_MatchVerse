import { Controller, Body, Get, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';

@Controller('match')
export class MatchController {
    constructor(private matchService: MatchService) { }

    @Post('request')
    createMatchRequest(@Body() payload: CreateMatchRequestDto) {
        return this.matchService.createMatchRequest(payload);
    }

    @Get('pending')
    getPendingRequest() {
        return this.matchService.getPendingRequests();

    }

    @Get('matched')
    getMatchedRequest() {
        return this.matchService.getMatchedRequest();
    }
}
