import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
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
});
