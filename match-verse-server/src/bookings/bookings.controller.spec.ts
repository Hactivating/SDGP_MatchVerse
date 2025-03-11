import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  let controller: BookingsController;

  const mockBooking = {
    bookingId: 3,
    courtId: 1,
    date: '2025-01-01',
    startingTime: '12:00',
    userId: null,
  };

  const mockUserBooking = {
    bookingId: 3,
    courtId: 1,
    date: '2025-01-01',
    startingTime: '12:00',
    userId: 1,
  };

  const mockBookingPayload = {
    courtId: 1,
    date: '2025-01-01',
    startingTime: '12:00',
  };

  const mockUserBookingPayload = {
    courtId: 1,
    date: '2025-01-01',
    startingTime: '12:00',
    userId:1
  };

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
    {
      date: '2025-01-01',
      starts: '09:00',
      isBooked: false,
    },
    {
      date: '2025-01-01',
      starts: '10:00',
      isBooked: false,
    },
    {
      date: '2025-01-01',
      starts: '11:00',
      isBooked: false,
    },
    {
      date: '2025-01-01',
      starts: '12:00',
      isBooked: false,
    },
    {
      date: '2025-01-01',
      starts: '13:00',
      isBooked: false,
    },
  ];

  const mockBookingService = {
    getBookings: jest.fn().mockResolvedValue(mockBookings),
    getBookingsByUser: jest.fn().mockResolvedValue(mockUserBookings),
    createVenueBooking: jest.fn().mockResolvedValue(mockBooking),
    createUserBooking: jest.fn().mockResolvedValue(mockUserBooking),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [BookingsService],
    })
      .overrideProvider(BookingsService)
      .useValue(mockBookingService)
      .compile();

    controller = module.get<BookingsController>(BookingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return bookings for the day', async () => {
    const response = await controller.getBookings('1', '2025-01-01');
    expect(mockBookingService.getBookings).toHaveBeenCalledWith(
      1,
      '2025-01-01',
    );
    expect(response).toEqual(mockBookings);
  });

  it('should return bookings by a user', async () => {
    const response = await controller.getBookingsByUser('1');
    expect(mockBookingService.getBookingsByUser).toHaveBeenCalledWith(1);
    expect(response).toEqual(mockUserBookings);
  });

  it('should create booking by a venue', async () => {
    const response = await controller.createVenueBooking(mockBookingPayload);
    expect(mockBookingService.createVenueBooking).toHaveBeenCalledWith(mockBookingPayload);
    expect(response).toEqual(mockBooking);
  });

  it('should create booking by a user', async () => {
    const response = await controller.createUserBooking(mockUserBookingPayload);
    expect(mockBookingService.createUserBooking).toHaveBeenCalledWith(mockUserBookingPayload);
    expect(response).toEqual(mockUserBooking);
  });
});
