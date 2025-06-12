import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserType } from './entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CreateUserDto } from './dto/create-user.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let cartRepository: MockRepository<Cart>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Cart),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    cartRepository = module.get(getRepositoryToken(Cart));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create default users if database is empty', async () => {
      userRepository.count.mockResolvedValue(0);
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue({} as any);

      await service.onModuleInit();

      expect(userRepository.count).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledTimes(2);
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Usuário Padrão Comum',
        type: UserType.COMMON,
      });
      expect(createSpy).toHaveBeenCalledWith({
        name: 'Usuário Padrão VIP',
        type: UserType.VIP,
      });
      createSpy.mockRestore();
    });

    it('should not create default users if users already exist', async () => {
      userRepository.count.mockResolvedValue(2);
      const createSpy = jest.spyOn(service, 'create');

      await service.onModuleInit();

      expect(userRepository.count).toHaveBeenCalledTimes(1);
      expect(createSpy).not.toHaveBeenCalled();
      createSpy.mockRestore();
    });
  });

  describe('create', () => {
    it('should create a new user and a corresponding cart', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        type: UserType.VIP,
      };
      const newUser = { id: 'user-123', ...createUserDto } as User;
      const newCart = { id: 'cart-456', user: newUser } as Cart;

      userRepository.create.mockReturnValue(newUser);
      userRepository.save.mockResolvedValue(newUser);
      cartRepository.create.mockReturnValue(newCart);
      cartRepository.save.mockResolvedValue(newCart);

      const findOneSpy = jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(newUser);

      const result = await service.create(createUserDto);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(newUser);
      expect(cartRepository.create).toHaveBeenCalledWith({ user: newUser });
      expect(cartRepository.save).toHaveBeenCalledWith(newCart);
      expect(findOneSpy).toHaveBeenCalledWith(newUser.id);
      expect(result).toEqual(newUser);

      findOneSpy.mockRestore();
    });
  });

  describe('findOne', () => {
    it('should find and return a user by ID', async () => {
      const userId = 'user-123';
      const user = {
        id: userId,
        name: 'Found User',
        type: UserType.COMMON,
      } as User;
      userRepository.findOneBy.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'non-existent-id';
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });
});
