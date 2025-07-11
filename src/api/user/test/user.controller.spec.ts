import { Test, TestingModule } from '@nestjs/testing';
import { AppRequest, UserController } from '../user.controller';
import { UserService } from '../user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRoles } from '../../../enums/userRoles';
import { AuthorizationGuard } from '../../../guards/role.quard';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    toggleActive: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 1,
    uuid: 'test-uuid-123',
    first_name: 'Jan',
    last_name: 'Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48123456789',
    is_init_password: true,
    role: 'OFFICER' as UserRoles,
    default_site: { id: 1, name: 'Site 1' },
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    creator: 1,
    other_sites: [{ id: 2, name: 'Site 2' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(AuthorizationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        email: 'jan.kowalski@example.com',
        phone: '+48123456789',
        isInitPassword: true,
        role: 'OFFICER' as UserRoles,
        defaultSiteId: 1,
        isActive: true,
        otherSites: [2, 3],
        creatorId: 1,
      };

      mockUserService.create.mockResolvedValue(mockUser);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should create a user without optional fields', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Anna',
        lastName: 'Nowak',
        email: 'anna.nowak@example.com',
        isInitPassword: false,
        role: 'VIEWER' as UserRoles,
        defaultSiteId: 1,
        isActive: true,
        otherSites: [],
      };

      const userWithoutOptionalFields = {
        ...mockUser,
        phone: undefined,
        creatorId: undefined,
      };
      mockUserService.create.mockResolvedValue(userWithoutOptionalFields);

      // Act
      const result = await controller.create(createUserDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(userWithoutOptionalFields);
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        firstName: 'Error',
        lastName: 'Test',
        email: 'error.test@example.com',
        isInitPassword: true,
        role: 'OFFICER' as UserRoles,
        defaultSiteId: 1,
        isActive: true,
        otherSites: [],
      };

      const error = new Error('Database connection failed');
      mockUserService.create.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by uuid', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      mockUserService.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await controller.findOne(uuid);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(uuid);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      // Arrange
      const uuid = 'non-existent-uuid';
      mockUserService.findOne.mockResolvedValue(null);

      // Act
      const result = await controller.findOne(uuid);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(uuid);
      expect(result).toBeNull();
    });

    it('should handle service errors in findOne', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const error = new Error('Database error');
      mockUserService.findOne.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.findOne(uuid)).rejects.toThrow('Database error');
      expect(service.findOne).toHaveBeenCalledWith(uuid);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      // Arrange
      const paginateQuery = { page: 1, limit: 10, path: '' };
      const user = { ...mockUser };
      mockUserService.findAll.mockResolvedValue({
        items: [user],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });

      // Act
      const result = await controller.findAll(paginateQuery, {
        uuid: 'admin-uuid',
        role: 'ADMIN',
      } as unknown as AppRequest);

      // Assert
      // expect(service.findAll).toHaveBeenCalledWith(paginateQuery, {
      //   uuid: 'admin-uuid',
      //   role: 'ADMIN',
      // });
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        items: [user],
        meta: {
          totalItems: 1,
          itemCount: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      });
    });

    it('should return an empty list if no users exist', async () => {
      // Arrange
      const paginateQuery = { page: 1, limit: 10, path: '' };
      mockUserService.findAll.mockResolvedValue({
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      });

      // Act
      const result = await controller.findAll(paginateQuery, {
        uuid: 'admin-uuid',
        role: 'ADMIN',
      } as unknown as AppRequest);

      // Assert;
      // expect(service.findAll).toHaveBeenCalledWith(paginateQuery, {
      //   uuid: 'admin-uuid',
      //   role: 'ADMIN',
      // });
      expect(result).toEqual({
        items: [],
        meta: {
          totalItems: 0,
          itemCount: 0,
          itemsPerPage: 10,
          totalPages: 0,
          currentPage: 1,
        },
      });
    });

    it('should handle service errors during retrieval', async () => {
      // Arrange
      const paginateQuery = { page: 1, limit: 10, path: '' };
      const error = new Error('Failed to fetch users');
      mockUserService.findAll.mockRejectedValue(error);

      // Act & Assert
      await expect(
        controller.findAll(paginateQuery, {
          uuid: 'admin-uuid',
          role: 'ADMIN',
        } as unknown as AppRequest),
      ).rejects.toThrow('Failed to fetch users');
      // expect(service.findAll).toHaveBeenCalledWith(paginateQuery, {
      //   uuid: 'admin-uuid',
      //   role: 'ADMIN',
      // });
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
        email: 'updated.email@example.com',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(uuid, updateUserDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(uuid, updateUserDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedUser);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const updateUserDto: UpdateUserDto = {
        firstName: 'OnlyFirstName',
      };

      const updatedUser = { ...mockUser, firstName: 'OnlyFirstName' };
      mockUserService.update.mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(uuid, updateUserDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(uuid, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should handle service errors during update', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const updateUserDto: UpdateUserDto = { firstName: 'Error' };
      const error = new Error('Update failed');
      mockUserService.update.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.update(uuid, updateUserDto)).rejects.toThrow(
        'Update failed',
      );
      expect(service.update).toHaveBeenCalledWith(uuid, updateUserDto);
    });
  });

  describe('toggleActive', () => {
    it('should toggle user active status', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const toggledUser = { ...mockUser, is_active: false };
      mockUserService.toggleActive.mockResolvedValue(toggledUser);

      // Act
      const result = await controller.toggleActive(uuid);

      // Assert
      expect(service.toggleActive).toHaveBeenCalledWith(uuid);
      expect(service.toggleActive).toHaveBeenCalledTimes(1);
      expect(result).toEqual(toggledUser);
    });

    it('should handle service errors during toggle', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const error = new Error('Toggle failed');
      mockUserService.toggleActive.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.toggleActive(uuid)).rejects.toThrow(
        'Toggle failed',
      );
      expect(service.toggleActive).toHaveBeenCalledWith(uuid);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const deleteResult = { affected: 1 };
      mockUserService.remove.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.remove(uuid);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(uuid);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(deleteResult);
    });

    it('should handle removal of non-existent user', async () => {
      // Arrange
      const uuid = 'non-existent-uuid';
      const deleteResult = { affected: 0 };
      mockUserService.remove.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.remove(uuid);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(deleteResult);
    });

    it('should handle service errors during removal', async () => {
      // Arrange
      const uuid = 'test-uuid-123';
      const error = new Error('Delete failed');
      mockUserService.remove.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.remove(uuid)).rejects.toThrow('Delete failed');
      expect(service.remove).toHaveBeenCalledWith(uuid);
    });
  });

  describe('Controller Guards and Roles', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have UserService injected', () => {
      expect(service).toBeDefined();
    });
  });
});
