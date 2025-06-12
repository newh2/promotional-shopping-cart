import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserType } from './entities/user.entity';

const mockUsersService = {
  create: jest.fn(),
  findOne: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call usersService.create with the provided DTO', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        type: UserType.COMMON,
      };
      const expectedUser = { id: 'user-1', ...createUserDto } as User;

      mockUsersService.create.mockReturnValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne with the correct id', async () => {
      const userId = 'user-1';
      const expectedUser = {
        id: userId,
        name: 'Found User',
        type: UserType.VIP,
      } as User;

      mockUsersService.findOne.mockReturnValue(expectedUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });
  });
});
