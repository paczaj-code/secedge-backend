import { SetMetadata } from '@nestjs/common';
import { RequirePermissions, PERMISSION_KEY } from './permission.decorator';

// Mock SetMetadata
jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('RequirePermissions', () => {
  const mockSetMetadata = SetMetadata as jest.MockedFunction<
    typeof SetMetadata
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('PERMISSION_KEY', () => {
    it('should have correct permission key value', () => {
      expect(PERMISSION_KEY).toBe('permissions');
    });
  });

  describe('RequirePermissions decorator', () => {
    it('should call SetMetadata with correct key and single permission', () => {
      const permission = 'read:users';
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(permission);

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, [
        permission,
      ]);
      expect(decorator).toBe(mockDecorator);
    });

    it('should call SetMetadata with correct key and multiple permissions', () => {
      const permissions = ['read:users', 'write:users', 'delete:users'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(...permissions);

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
      expect(decorator).toBe(mockDecorator);
    });

    it('should call SetMetadata with empty array when no permissions provided', () => {
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions();

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, []);
      expect(decorator).toBe(mockDecorator);
    });

    it('should handle permissions with special characters', () => {
      const permissions = [
        'read:users:profile',
        'admin:*',
        'create:posts:draft',
      ];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(...permissions);

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
      expect(decorator).toBe(mockDecorator);
    });

    it('should preserve order of permissions', () => {
      const permissions = ['third', 'first', 'second'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(...permissions);

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
    });

    it('should handle duplicate permissions', () => {
      const permissions = ['read:users', 'read:users', 'write:users'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(...permissions);

      expect(mockSetMetadata).toHaveBeenCalledWith(PERMISSION_KEY, permissions);
    });

    it('should work with string array spread', () => {
      const permissionArray = ['read:posts', 'write:posts'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = RequirePermissions(...permissionArray);

      expect(mockSetMetadata).toHaveBeenCalledWith(
        PERMISSION_KEY,
        permissionArray,
      );
    });
  });
});
