import { Test, TestingModule } from '@nestjs/testing';
import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dto/create-court.dto';

describe('CourtsController', () => {
  let controller: CourtsController;

  const createCourt = {
    name: 'fusion',
    venueId: 1,
  }


  const mockCourtsService = {
    //fake implementation of the create 
    create: jest.fn().mockResolvedValue(court),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourtsController],
      providers: [CourtsService]
      //provider - override the injected dependency 
    }).overrideProvider(CourtsService).useValue(mockCourtsService).compile();

    controller = module.get<CourtsController>(CourtsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a court', () => {
    expect(controller.createCourt({ name: 'Fusion', venueId: 1 })).toEqual({
      name: 'Fusion',
      venueId: expect.any(Number),
    });

    expect(mockCourtsService.createCourt).toHaveBeenCalledWith({ name: 'Fusion', venueId: 1 })
  });


});
