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
    venueName:"venue Name"
  };

  const createdVenue = {
    venueId: 1,
    rating: 0,
    venueImageUrl: '34343434sdfsdsd',
    totalRating: 0,
    ...mockVenue,
  };

  const mockVenueService = {
    createNewVenue: jest.fn().mockResolvedValue(createdVenue),
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
});
