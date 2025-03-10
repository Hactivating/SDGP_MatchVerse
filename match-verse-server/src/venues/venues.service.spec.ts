import { Test, TestingModule } from '@nestjs/testing';
import { VenuesService } from './venues.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('VenuesService', () => {
  let service: VenuesService;
  let prisma: PrismaService;
  let s3Service: S3Service;

  const mockCreateVenueDto = {
    email: '1@gmail.com',
    password: '1234',
    location: 'right here',
    openingTime: 900,
    closingTime: 1400,
    venueName: 'tennis kindom',
  };

  const mockVenue = {
    venueId: 1,
    email: '1@gmail.com',
    password: '$2b$10$wsb2/Va.7xNFgGPa8j7oVODfAZkjCf0T5bTHveNiyk7Fgh.AZ4mbq',
    location: 'right here',
    openingTime: 900,
    closingTime: 1400,
    venueImageUrl: null,
    rating: 0,
    totalRating: 0,
    venueName: 'tennis kindom',
  };

  const mockAllVenues = [
    {
      venueId: 1,
      email: '1@gmail.com',
      password: '$2b$10$wsb2/Va.7xNFgGPa8j7oVODfAZkjCf0T5bTHveNiyk7Fgh.AZ4mbq',
      location: 'right here',
      openingTime: 900,
      closingTime: 1400,
      venueImageUrl: null,
      rating: 0,
      totalRating: 0,
      venueName: 'tennis kindom',
    },
    {
      venueId: 2,
      email: '2@gmail.com',
      password: '$2b$10$wsb2/Va.7xNFsdsda8j7oVODfAZkjCf0T5bTHveNiyk7Fgh.AZ4mbq',
      location: 'right here',
      openingTime: 900,
      closingTime: 1400,
      venueImageUrl: null,
      rating: 0,
      totalRating: 0,
      venueName: 'tennis kindom2',
    },
  ];

  const mockPrismaService = {
    venue: {
      findMany: jest.fn().mockResolvedValue(mockAllVenues),
      findFirst: jest.fn().mockResolvedValue(mockVenue),
      create: jest.fn().mockResolvedValue(mockVenue),
      update: jest.fn().mockResolvedValue(mockVenue),
      delete: jest.fn().mockResolvedValue(mockVenue),
    },
    userVenueRating: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mocks3Service = {
    uploadFile: jest.fn(),
  };

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
    prisma = module.get<PrismaService>(PrismaService);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find all venues', async () => {
    const response = await service.getAllVenues();
    expect(mockPrismaService.venue.findMany).toHaveBeenCalled();
    expect(response).toEqual(mockAllVenues);
  });

  it('should find a venue by email', async () => {
    const response = await service.getVenueByEmail('1@gmail.com');
    expect(mockPrismaService.venue.findFirst).toHaveBeenCalled();
    expect(response).toEqual(mockVenue);
  });

  it('create a venue', async () => {
    const response = await service.createNewVenue(mockCreateVenueDto);
    expect(mockPrismaService.venue.create).toHaveBeenCalledWith(
      {data:mockCreateVenueDto}
    );
    expect(response).toEqual(mockVenue);
  });

  it('delete a venue', async () => {
    const response = await service.deleteVenue(1);
    expect(mockPrismaService.venue.delete).toHaveBeenCalledWith(1);
    expect(response).toEqual(mockVenue);
  });
});
