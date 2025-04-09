import { Controller, Body, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchRequestDto } from './DTO/create-match-request.dto';
import { JoinMatchDto } from './DTO/join-match.dto';
import { JoinSinglesDto } from './DTO/join-singles.dto';

@Controller('match')
export class MatchController {
    constructor(private matchService: MatchService) { }

    @Post('request')
    createMatchRequest(@Body() payload: CreateMatchRequestDto) {
        return this.matchService.createMatchRequest(payload);
    }

    @Post('join')
    joinMatch(@Body() payload: JoinMatchDto) {
        return this.matchService.joinMatch(payload);
    }

    @Get('pending')
    getPendingRequest() {
        return this.matchService.getPendingRequests();
    }

    @Get('matched')
    getMatchedRequest() {
        return this.matchService.getMatchedRequest();
    }

    @Get('available-singles')
    getAvailableSinglesMatches() {
        return this.matchService.getAvailableSinglesMatches();
    }

    @Post('join-singles')
    joinSinglesMatch(@Body() payload: JoinSinglesDto) {
        return this.matchService.joinSinglesMatch(payload);
    }
}