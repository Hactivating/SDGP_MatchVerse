import { Test, TestingModule } from '@nestjs/testing';
import { MatchResultController } from './match-result.controller';

describe('MatchResultController', () => {
  let controller: MatchResultController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchResultController],
    }).compile();

    controller = module.get<MatchResultController>(MatchResultController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
