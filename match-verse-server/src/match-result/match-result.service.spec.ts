import { Test, TestingModule } from '@nestjs/testing';
import { MatchResultService } from './match-result.service';

describe('MatchResultService', () => {
  let service: MatchResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchResultService],
    }).compile();

    service = module.get<MatchResultService>(MatchResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
