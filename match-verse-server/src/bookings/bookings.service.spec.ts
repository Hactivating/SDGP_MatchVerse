import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';


describe('BookingsService', () => {
  let service: BookingsService;

  const mockBookingsDate = [
    {
      date: '2025-01-01',
      starts: '09:00',
      isBooked: false,
    },
    {
      date: '2025-01-01',
      starts: '10:00',
      isBooked: true,
    },
    {
      date: '2025-01-01',
      starts: '11:00',
      isBooked: true,
    },
    {
      date: '2025-01-01',
      starts: '12:00',
      isBooked: true,
    },
    {
      date: '2025-01-01',
      starts: '13:00',
      isBooked: true,
    },
  ];

  const mockUserBookings = [
    {
      bookingId: 4,
      courtId: 1,
      date: '2025-01-01',
      startingTime: '13:00',
      userId: 1,
    },
    {
      bookingId: 5,
      courtId: 1,
      date: '2025-01-02',
      startingTime: '10:00',
      userId: 1,
    },
  ];

  const mockBookings = [
    { startingTime: '10:00' },
    { startingTime: '11:00' },
    { startingTime: '12:00' },
    { startingTime: '13:00' },
  ];

  const mockBooking=
    {
      bookingId: 5,
      courtId: 1,
      date: '2025-01-02',
      startingTime: '10:00',
      userId: null,
    }

  

  const mockCourtVenue = {
    courtId: 1,
    name: '3434',
    venueId: 1,
    venue: {
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
  };

  const mockCreateBookingDto = {
    courtId: 1,
    date: '2025-01-01',
    startingTime: '10:00',
  };

  const mockPrismaService = {
    booking: {
      findMany: jest.fn((query)=>{
        if(query.where.userId!==undefined){
          return Promise.resolve(mockUserBookings);
        }
        else{
          return Promise.resolve(mockBookings); 
        }
        
      }),
      create: jest.fn().mockResolvedValue(mockBooking),
    },
    court: {
      findUnique: jest.fn().mockResolvedValue(mockCourtVenue),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all booking slots for a date', async () => {
    const bookingRespone = await service.getBookings(1, '2025-01-01');
    expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
      where: { courtId: 1, date: '2025-01-01' },
      select: { startingTime: true },
    });

    expect(mockPrismaService.court.findUnique).toHaveBeenCalledWith({
      where: { courtId: 1 },
      include: { venue: true },
    });

    expect(bookingRespone).toEqual(mockBookingsDate);
  });

  it('should get all booking slots by a user', async () => {
    const UserbookingRespone = await service.getBookingsByUser(1);
    expect(mockPrismaService.booking.findMany).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(UserbookingRespone).toEqual(mockUserBookings);
  });

  it('should create a booking', async () => {
    const createBookingResponse = await service.createBooking(mockCreateBookingDto);
    expect(mockPrismaService.booking.create).toHaveBeenCalledWith({data:mockCreateBookingDto});
    expect(createBookingResponse).toEqual(mockBooking);
  });
});
