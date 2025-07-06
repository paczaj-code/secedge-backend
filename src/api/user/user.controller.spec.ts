import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      toggleActive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('update', () => {
    it('should update a user and return the updated record', async () => {
      const uuid = 'sample-uuid';
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated.user@example.com',
      };

      const result = {
        id: 1,
        uuid: 'sample-uuid',
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated.user@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as User;

      // @ts-ignore
      jest.spyOn(userService, 'update').mockResolvedValue(result);

      expect(await userController.update(uuid, updateUserDto)).toBe(result);
      expect(userService.update).toHaveBeenCalledWith(uuid, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during update', async () => {
      const uuid = 'sample-uuid';
      const updateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated.user@example.com',
      };

      jest
        .spyOn(userService, 'update')
        .mockRejectedValue(new Error('Update failed'));

      await expect(userController.update(uuid, updateUserDto)).rejects.toThrow(
        'Update failed',
      );
      expect(userService.update).toHaveBeenCalledWith(uuid, updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [
        {
          id: 1,
          uuid: 'sample-uuid-1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'some',
          phone: '1234567890',
          default_site: {
            id: 1,
            name: 'Default Site',
            uuid: 'default-site-uuid',
          },
          other_sites: [
            { id: 2, name: 'Other Site 1', uuid: 'other-site-1-uuid' },
            { id: 3, name: 'Other Site 2', uuid: 'other-site-2-uuid' },
          ],
          role: 'user',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown as User[];
      jest.spyOn(userService, 'findAll').mockResolvedValue(result);

      expect(await userController.findAll()).toBe(result);
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new user and return it', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '9876543210',
        isInitPassword: true,
        role: 'admin',
        defaultSiteId: 1,
        isActive: true,
        otherSites: [2, 3],
        creatorId: 5,
      } as unknown as CreateUserDto;

      const result = {
        id: 1,
        uuid: 'new-user-uuid',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '9876543210',
        isInitPassword: true,
        role: 'admin',
        defaultSiteId: 1,
        isActive: true,
        otherSites: [2, 3],
        creatorId: 5,
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as User;

      jest.spyOn(userService, 'create').mockResolvedValue(result);

      expect(await userController.create(createUserDto)).toBe(result);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(userService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single user by uuid', async () => {
      const result = {
        id: 1,
        uuid: 'sample-uuid-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'some',
        phone: '1234567890',
        default_site: {
          id: 1,
          name: 'Default Site',
          uuid: 'default-site-uuid',
        },
        other_sites: [
          { id: 2, name: 'Other Site 1', uuid: 'other-site-1-uuid' },
          { id: 3, name: 'Other Site 2', uuid: 'other-site-2-uuid' },
        ],
        role: 'user',
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as User;
      jest.spyOn(userService, 'findOne').mockResolvedValue(result);

      const uuid = 'sample-uuid-1';
      expect(await userController.findOne(uuid)).toBe(result);
      expect(userService.findOne).toHaveBeenCalledWith(uuid);
      expect(userService.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleActive', () => {
    it('should toggle user active status and return the updated user', async () => {
      const uuid = 'sample-uuid-1';
      const result = {
        id: 1,
        uuid: 'sample-uuid-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isActive: false,
        created_at: new Date(),
        updated_at: new Date(),
      } as unknown as User;

      // @ts-ignore
      jest.spyOn(userService, 'toggleActive').mockResolvedValue(result);

      expect(await userController.toggleActive(uuid)).toBe(result);
      expect(userService.toggleActive).toHaveBeenCalledWith(uuid);
      expect(userService.toggleActive).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during toggleActive', async () => {
      const uuid = 'sample-uuid-1';

      jest
        .spyOn(userService, 'toggleActive')
        .mockRejectedValue(new Error('Toggle failed'));

      await expect(userController.toggleActive(uuid)).rejects.toThrow(
        'Toggle failed',
      );
      expect(userService.toggleActive).toHaveBeenCalledWith(uuid);
      expect(userService.toggleActive).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user and return successful response', async () => {
      const uuid = 'sample-uuid-2';
      const result = { success: true };

      // @ts-ignore
      jest.spyOn(userService, 'remove').mockResolvedValue(result);

      expect(await userController.remove(uuid)).toBe(result);
      expect(userService.remove).toHaveBeenCalledWith(uuid);
      expect(userService.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during remove', async () => {
      const uuid = 'sample-uuid-2';

      jest
        .spyOn(userService, 'remove')
        .mockRejectedValue(new Error('Deletion failed'));

      await expect(userController.remove(uuid)).rejects.toThrow(
        'Deletion failed',
      );
      expect(userService.remove).toHaveBeenCalledWith(uuid);
      expect(userService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
