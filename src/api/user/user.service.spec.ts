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

  describe('create', () => {
    it('should successfully create and return a user', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '123-456-7890',
        isInitPassword: true,
        role: 'USER',
        defaultSiteId: 1,
        isActive: true,
        otherSites: [],
      };
      const savedUser = {
        id: 1,
        uuid: 'valid-uuid-2',
        ...createUserDto,
      };

      userRepository.create = jest.fn().mockReturnValue(savedUser);
      userRepository.save = jest.fn().mockResolvedValue(savedUser);

      const result = await service.create(createUserDto as any);

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).toEqual(savedUser);
    });

    it('should throw an error when user creation fails', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '123-456-7890',
        isInitPassword: true,
        role: 'USER',
        defaultSiteId: 1,
        isActive: true,
        otherSites: [],
      };

      userRepository.create = jest.fn();
      userRepository.save = jest
        .fn()
        .mockRejectedValue(new Error('Save failed'));

      await expect(service.create(createUserDto as any)).rejects.toThrow(
        'Save failed',
      );

      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalled();
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

  describe('remove', () => {
    it('should successfully remove a user with a valid UUID', async () => {
      const deleteResult = { affected: 1 }; // Represents successful delete
      userRepository.createQueryBuilder = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(deleteResult),
      })) as any;

      const uuid = 'valid-uuid-1';
      const result = await service.remove(uuid);

      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(deleteResult);
    });

    it('should throw an error when removing a user fails', async () => {
      userRepository.createQueryBuilder = jest.fn(() => ({
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Delete failed')),
      })) as any;

      const uuid = 'invalid-uuid';

      await expect(service.remove(uuid)).rejects.toThrow('Delete failed');
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it('should toggle is_active from true to false and update in the database', async () => {
      const uuid = 'valid-uuid';
      const mockUser = { uuid, is_active: true };

      jest.spyOn(service as any, 'findUserByUuid').mockResolvedValue(mockUser);
      userRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })) as any;

      const result = await service.toggleActive(uuid);

      expect(service['findUserByUuid']).toHaveBeenCalledWith(uuid);
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });
    });

    it('should toggle is_active from false to true and update in the database', async () => {
      const uuid = 'valid-uuid';
      const mockUser = { uuid, is_active: false };

      jest.spyOn(service as any, 'findUserByUuid').mockResolvedValue(mockUser);
      userRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      })) as any;

      const result = await service.toggleActive(uuid);

      expect(service['findUserByUuid']).toHaveBeenCalledWith(uuid);
      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual({ affected: 1 });
    });

    it('should throw an error if user is not found', async () => {
      const uuid = 'invalid-uuid';
      jest
        .spyOn(service as any, 'findUserByUuid')
        .mockRejectedValue(new Error('User not found'));

      await expect(service.toggleActive(uuid)).rejects.toThrow(
        'User not found',
      );
      expect(service['findUserByUuid']).toHaveBeenCalledWith(uuid);
    });
  });

  describe('findUserByUuid', () => {
    it('should return the user if a valid UUID is provided', async () => {
      const uuid = 'valid-uuid';
      const mockUser = {
        id: 1,
        uuid: 'valid-uuid',
        first_name: 'John',
        last_name: 'Doe',
      };

      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      const result = await service.findUserByUuid(uuid);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { uuid } });
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if no user is found with the given UUID', async () => {
      const uuid = 'invalid-uuid';

      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findUserByUuid(uuid)).rejects.toThrow(
        `User with uuid ${uuid} not found`,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { uuid } });
    });
  });

  describe('update', () => {
    it('should successfully update a user and return the result', async () => {
      const uuid = 'valid-uuid';
      const updateUserDto = { firstName: 'Updated', lastName: 'User' };
      const mockUpdateResult = { affected: 1 };

      userRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(mockUpdateResult),
      })) as any;

      const result = await service.update(uuid, updateUserDto as any);

      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
      expect(result).toEqual(mockUpdateResult);
    });

    it('should throw an error when update fails', async () => {
      const uuid = 'invalid-uuid';
      const updateUserDto = { firstName: 'Failed', lastName: 'Update' };

      userRepository.createQueryBuilder = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockRejectedValue(new Error('Update failed')),
      })) as any;

      await expect(service.update(uuid, updateUserDto as any)).rejects.toThrow(
        'Update failed',
      );

      expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });
});
