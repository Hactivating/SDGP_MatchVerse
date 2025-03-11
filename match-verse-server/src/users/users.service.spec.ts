import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser= {
    "userId": 1,
    "username": "user1",
    "email": "1@gmail.com",
    "password": "$2b$10$QI7Dz4lTUPwjAiDVoQaDjuZoesTErSMPj4ikiGCfP7dZpxRhATwaS",
    "experience": 0,
    "rating": 0,
    "userImageUrl": null
  }

  const mockAllUsers=[
    {
      "userId": 1,
      "username": "user1",
      "email": "1@gmail.com",
      "password": "$2b$10$QI7Dz4lTUPwjAiDVoQaDjuZoesTErSMPj4ikiGCfP7dZpxRhATwaS",
      "experience": 0,
      "rating": 0,
      "userImageUrl": null
    }, {
      "userId": 2,
      "username": "user2",
      "email": "2@gmail.com",
      "password": "$2b$10$QI7Dz4lTsdsdAiDVoQaDjuZoesTErSMPj4ikiGCfP7dZpxRhATwaS",
      "experience": 0,
      "rating": 0,
      "userImageUrl": null
    }
  ];
  const mockCreateUserDto={
    "username":"user1",
    "email":"1@gmail.com",
    "password":"1234"
  }

  const mockPrismaService = {
    user: {
      findMany: jest.fn().mockResolvedValue(mockAllUsers),
      findFirst: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
    },
  };

  const mockS3Service = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, S3Service],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(S3Service)
      .useValue(mockS3Service)
      .compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('should find all users', async () => {
    const response = await service.getAllUsers();
    expect(mockPrismaService.user.findMany).toHaveBeenCalled();
    expect(response).toEqual(mockAllUsers);
  });

  it('should find a user by email', async () => {
    const response = await service.getUserByEmail('1@gmail.com');
    expect(mockPrismaService.user.findFirst).toHaveBeenCalled();
    expect(response).toEqual(mockUser);
  });

  it('create a user', async () => {
    const response = await service.createNewUser(mockCreateUserDto);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: mockCreateUserDto,
    });
    expect(response).toEqual(mockUser);
  });

  it('delete a user', async () => {
    const response = await service.deleteUser(1);
    expect(mockPrismaService.user.delete).toHaveBeenCalledWith({where:{userId:1}});
    expect(response).toEqual(mockUser);
  });
});
