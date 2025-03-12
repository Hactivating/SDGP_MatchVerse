import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { VenuesService } from '../venues/venues.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let venuesService: VenuesService;
  let usersService: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {};
  const mockVenuesService = {};
  const mockUsersService = {};



  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,PrismaService,UsersService,VenuesService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(VenuesService)
      .useValue(mockVenuesService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
