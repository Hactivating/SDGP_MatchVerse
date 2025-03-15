import { Test, TestingModule } from '@nestjs/testing';
import { CourtsService } from './courts.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { mock } from 'node:test';
import exp from 'constants';

describe('CourtsService', () => {
  let service: CourtsService;

  let mockPrismaService: Partial<PrismaService>

  const mockCourt = {
    courtId: 1,
    name: 'Fusion',
    venueId: 1
  };

  const mockS3Service = {};



  beforeEach(async () => {

    mockPrismaService = {
      court: {
        findMany: jest.fn().mockResolvedValue([mockCourt]),
        findUnique: jest.fn().mockImplementation(({ where }) =>
          where.courtId === 1 ? Promise.resolve(mockCourt) : Promise.resolve(null),),
        create: jest.fn().mockResolvedValue([mockCourt]),
        delete: jest.fn().mockResolvedValue([mockCourt]),
      }

    };


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

  it('should find all many courts', async () => {
    const result = await service.getAllCourts();
    expect(result).toEqual([mockCourt]);
    expect(mockPrismaService.court?.findMany).toHaveBeenCalled();
  });

  it('should find court by ID', async () => {
    const result = await service.getCourtById(1); //returns the object and not only courtId
    expect(result).toEqual(mockCourt);
    expect(mockPrismaService.court.findUnique).toHaveBeenCalledWith({
      where: {
        courtId: 1
      }
    });
  });



});
