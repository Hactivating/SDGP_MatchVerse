import { Test, TestingModule } from '@nestjs/testing';
import { CourtsService } from './courts.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('CourtsService', () => {
  let service: CourtsService;

  const mockPrismaService = {};

  const mockS3Service = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourtsService, PrismaService, S3Service],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(S3Service)
      .useValue(mockS3Service)
      .compile();

    service = module.get<CourtsService>(CourtsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
