import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest
        .fn()
        .mockResolvedValue([
          { id: 1, uuid: 'valid-uuid-1', first_name: 'John', last_name: 'Doe' },
        ]),
      getOne: jest.fn().mockResolvedValue({
        id: 1,
        uuid: 'valid-uuid-1',
        first_name: 'John',
        last_name: 'Doe',
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const result = await service.findAll();
      expect(result).toEqual([
        { id: 1, uuid: 'valid-uuid-1', first_name: 'John', last_name: 'Doe' },
      ]);
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user for a valid UUID', async () => {
      const uuid = 'valid-uuid-1';
      const result = await service.findOne(uuid);
      expect(result).toEqual({
        id: 1,
        uuid: 'valid-uuid-1',
        first_name: 'John',
        last_name: 'Doe',
      });
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'user.uuid = :uuid',
        { uuid },
      );
    });

    it('should return null for an invalid UUID', async () => {
      mockUserRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(null);
      const uuid = 'invalid-uuid';
      const result = await service.findOne(uuid);
      expect(result).toBeNull();
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'user.uuid = :uuid',
        { uuid },
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user for a valid email', async () => {
      const email = 'john.doe@example.com';
      mockUserRepository.createQueryBuilder().getOne.mockResolvedValueOnce({
        id: 1,
        uuid: 'valid-uuid-1',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        hashed_password: 'hashedPassword123',
      });

      const result = await service.findUserByEmail(email);

      expect(result).toEqual({
        id: 1,
        uuid: 'valid-uuid-1',
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        hashed_password: 'hashedPassword123',
      });
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
    });

    it('should return null for an invalid email', async () => {
      const email = 'invalid@example.com';
      mockUserRepository
        .createQueryBuilder()
        .getOne.mockResolvedValueOnce(null);

      const result = await service.findUserByEmail(email);

      expect(result).toBeNull();
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalledWith(
        'user.email = :email',
        { email },
      );
    });
  });
});
