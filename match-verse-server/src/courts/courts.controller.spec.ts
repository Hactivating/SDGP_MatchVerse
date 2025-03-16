import { Test, TestingModule } from '@nestjs/testing';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { mock } from 'node:test';
import { VenuesController } from 'src/venues/venues.controller';
import { Controller } from '@nestjs/common';

describe('CourtsController', () => {
  let controller: CourtsController;

  let mockCourtsService: Partial<CourtsService> //selective mocking of the service

  const mockCourt = {
    id: 1,
    name: 'fusion',
    venueId: 1,
  }


  beforeEach(async () => {

    mockCourtsService = {
      getAllCourts: jest.fn().mockResolvedValue([mockCourt]),
      getCourtById: jest.fn().mockImplementation((id) => Promise.resolve({ ...mockCourt, id })),   //to return dynamic argument
      createCourt: jest.fn().mockImplementation((mockCourt) => Promise.resolve({ id: 1, ...mockCourt })),
      deleteCourt: jest.fn().mockResolvedValue({ message: 'Court has been deleted' })
    }


    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourtsController],
      providers: [CourtsService],
    })
      .overrideProvider(CourtsService)
      .useValue(mockCourtsService)
      .compile();

    controller = module.get<CourtsController>(CourtsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all courts', async () => {
    const result = await controller.getAllCourts();
    expect(result).toEqual([mockCourt]);
  });

  it('should get a court by ID', async () => {
    const result = await controller.getCourtById(mockCourt.id.toString());
    expect(result).toEqual([mockCourt]);
  })

  it('should create a new court', async () => {
    const newCourt = { name: mockCourt.name, venueId: mockCourt.venueId };
    const result = await controller.createCourt(newCourt);
    expect(result).toEqual({ id: 1, ...newCourt });
    expect(mockCourtsService.createCourt).toHaveBeenCalledWith(newCourt); //to check service and return
  })

  it('should delete a court', async () => {
    const result = controller.deleteCourt(mockCourt.id.toString());
    expect(result).toEqual({ message: 'Court has been deleted' })
  });


});






