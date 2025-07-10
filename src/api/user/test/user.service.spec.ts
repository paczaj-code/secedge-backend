// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        isInitPassword: true,
        role: 'USER',
        defaultSiteId: 1,
        isActive: true,
        otherSites: [],
      };
      const userEntity = { ...createUserDto, id: 1 } as unknown as User;

      jest.spyOn(userRepository, 'create').mockReturnValue(userEntity);
      jest.spyOn(userRepository, 'save').mockResolvedValue(userEntity);

      const result = await service.create(createUserDto as any);
      expect(result).toEqual(userEntity);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(userEntity);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: 1, firstName: 'John' }] as unknown as User[];
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue(users),
          }) as any,
      );

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const uuid = '123';
      const user = { id: 1, uuid } as User;
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(user),
          }) as any,
      );

      const result = await service.findOne(uuid);
      expect(result).toEqual(user);
    });

    it('should throw an exception if user not found', async () => {
      const uuid = '123';
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as any,
      );

      await expect(service.findOne(uuid)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should return a user if email is found', async () => {
      const email = 'johndoe@example.com';
      const user = { id: 1, email } as User;
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(user),
          }) as any,
      );

      const result = await service.findUserByEmail(email);
      expect(result).toEqual(user);
    });

    it('should throw an exception if email is not found', async () => {
      const email = 'johndoe@example.com';
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as any,
      );

      await expect(service.findUserByEmail(email)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const uuid = '123';
      const updateUserDto = { firstName: 'Updated' };
      const updateResult = { affected: 1 };

      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue(updateResult),
          }) as any,
      );

      const result = await service.update(uuid, updateUserDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const uuid = '123';
      const deleteResult = { affected: 1 };

      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            delete: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue(deleteResult),
          }) as any,
      );

      const result = await service.remove(uuid);
      expect(result).toEqual(deleteResult);
    });
  });
});
