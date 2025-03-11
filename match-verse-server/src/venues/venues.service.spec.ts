import { Test, TestingModule } from '@nestjs/testing';
import { VenuesService } from './venues.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('VenuesService', () => {
  let service: VenuesService;

  const mockPrismaService = {};

  const mocks3Service = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VenuesService, PrismaService, S3Service],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(S3Service)
      .useValue(mocks3Service)
      .compile();

    service = module.get<VenuesService>(VenuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
