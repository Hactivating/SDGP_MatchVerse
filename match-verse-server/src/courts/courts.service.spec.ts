import { Test, TestingModule } from '@nestjs/testing';
import { CourtsService } from './courts.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { mock } from 'node:test';
import exp from 'constants';
import { NotFoundException } from '@nestjs/common';

describe('CourtsService', () => {
  let service: CourtsService;



  let prisma: Partial<PrismaService>

  const mockCourt = {
    courtId: 1,
    name: 'Fusion',
    venueId: 1
  };

  const mockS3Service = {};



  beforeEach(async () => {

    prisma = {
      court: {
        findMany: jest.fn().mockResolvedValue([mockCourt]),
        findUnique: jest.fn().mockImplementation(({ where }) =>
          where.courtId === 1 ? Promise.resolve(mockCourt) : Promise.resolve(null)),
        create: jest.fn().mockResolvedValue(mockCourt),
        delete: jest.fn().mockResolvedValue(mockCourt),
      }
    } as unknown as PrismaService;  //mock is a complete service rather than partial




    const module: TestingModule = await Test.createTestingModule({
      providers: [CourtsService, PrismaService, S3Service],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
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
    expect(prisma.court?.findMany).toHaveBeenCalled();
  });

  it('should find court by ID', async () => {
    const result = await service.getCourtById(1); //returns the object and not only courtId
    expect(result).toEqual(mockCourt);
    expect(prisma.court?.findUnique).toHaveBeenCalledWith({
      where: {
        courtId: 1
      },
    });

  });

  it('should throw exception, if court not found', async () => {
    await expect(service.getCourtById(99)).rejects.toThrow(NotFoundException);
  });

  it('should create a new court', async () => {
    const newCourt = { name: 'TestCourt', venueId: 2 };
    const createdCourt = { courtId: 2, ...newCourt };

    (prisma.court.create as jest.Mock).mockRejectedValueOnce(createdCourt);


    const result = await service.createCourt(newCourt);
    expect(result).toEqual(createdCourt);
    expect(prisma.court?.create).toHaveBeenCalledWith({ data: newCourt }); //newCourt object
  });

  it('should delete a court', async () => {
    const result = await service.deleteCourt(1);
    expect(result).toEqual(mockCourt);
    expect(prisma.court?.delete).toHaveBeenLastCalledWith({ where: { courtId: 1 } });
  });





});

