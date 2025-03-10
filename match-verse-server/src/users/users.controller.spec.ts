import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser = {
    email: 'test@gmail.com',
    password: '1234',
    username: 'user1',
  };

  const createdUser = {
    userId: 1,
    rating: 0,
    userImageUrl: '34343434sdfsdsd',
    experience: 0,
    ...mockUser,
  };

  const allUsers = [
    createdUser,
    {
      email: 'test1@gmail.com',
      userId: 2,
      userImageUrl: 'sdsdsdsd',
      password: '1234',
      username: 'user Name2',
      experience: 0,
      rating: 0,
    },
  ];

  const mockUserService = {
    createNewUser: jest.fn().mockResolvedValue(createdUser),
    getAllUsers: jest.fn().mockResolvedValue(allUsers),
    deleteUser: jest.fn().mockResolvedValue(createdUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const response = await controller.createNewUser(mockUser);

    expect(mockUserService.createNewUser).toHaveBeenCalledWith(mockUser);

    expect(response).toEqual(createdUser);
  });

  it('should return all users', async () => {
    const response = await controller.getAllUsers();
    expect(mockUserService.getAllUsers).toHaveBeenCalled();

    expect(response).toEqual(allUsers);
  });

  it('should delete a user', async () => {
    const response = await controller.deleteUser('1');
    expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);

    expect(response).toEqual(createdUser);
  });
});
