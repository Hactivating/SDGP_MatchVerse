import { Test, TestingModule } from '@nestjs/testing';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';

describe('VenuesController', () => {
  let controller: VenuesController;
  //mock venue details to enter
  const mockVenue = {
    email: 'test@gmail.com',
    password: '1234',
    location: 'right here',
    openingTime: 900,
    closingTime: 1700,
    venueName: 'venue Name',
  };

  const createdVenue = {
    venueId: 1,
    rating: 0,
    venueImageUrl: '34343434sdfsdsd',
    totalRating: 0,
    ...mockVenue,
  };

  const allVenues = [
    createdVenue,
    {
      email: 'test1@gmail.com',
      venueId: 2,
      rating: 0,
      venueImageUrl: 'sdsdsdsd',
      totalRating: 0,
      password: '1234',
      location: 'not right here',
      openingTime: 900,
      closingTime: 1700,
      venueName: 'venue Name2',
    },
  ];

  const rating = {
    rating: 5,
    userId: 1,
  };

  const mockVenueService = {
    createNewVenue: jest.fn().mockResolvedValue(createdVenue),
    getAllVenues: jest.fn().mockResolvedValue(allVenues),
    deleteVenue: jest.fn().mockResolvedValue(createdVenue),
    rateVenue: jest.fn().mockResolvedValue(createdVenue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VenuesController],
      providers: [VenuesService],
    })
      .overrideProvider(VenuesService)
      .useValue(mockVenueService)
      .compile();

    controller = module.get<VenuesController>(VenuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a venue', async () => {
    const response = await controller.createNewVenue(mockVenue);

    expect(mockVenueService.createNewVenue).toHaveBeenCalledWith(mockVenue);

    expect(response).toEqual(createdVenue);
  });

  it('should return all venues', async () => {
    const response = await controller.getAllVenues();
    expect(mockVenueService.getAllVenues).toHaveBeenCalled();

    expect(response).toEqual(allVenues);
  });

  it('should delete a venue', async () => {
    const response = await controller.deleteVenue('1');
    expect(mockVenueService.deleteVenue).toHaveBeenCalledWith(1);

    expect(response).toEqual(createdVenue);
  });

  it('should rate a venue', async () => {
    const response = await controller.rateVenue('1', rating);
    expect(mockVenueService.rateVenue).toHaveBeenCalledWith(1, rating);

    expect(response).toEqual(createdVenue);
  });
});
