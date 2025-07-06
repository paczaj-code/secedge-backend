import { SetMetadata } from '@nestjs/common';
import { Role, ROLE_KEY } from './role.decorator';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn(),
}));

describe('Role Decorator', () => {
  const mockSetMetadata = SetMetadata as jest.MockedFunction<
    typeof SetMetadata
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('ROLE_KEY', () => {
    it('should have correct role key value', () => {
      expect(ROLE_KEY).toBe('roles');
    });

    it('should be a string constant', () => {
      expect(typeof ROLE_KEY).toBe('string');
    });
  });

  describe('Role decorator', () => {
    it('should call SetMetadata with correct key and single role', () => {
      const role = 'admin';
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(role);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, [role]);
      expect(decorator).toBe(mockDecorator);
    });

    it('should call SetMetadata with correct key and multiple roles', () => {
      const roles = ['admin', 'user', 'moderator'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roles);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roles);
      expect(decorator).toBe(mockDecorator);
    });

    it('should call SetMetadata with empty array when no roles provided', () => {
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role();

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, []);
      expect(decorator).toBe(mockDecorator);
    });

    it('should handle roles with special characters', () => {
      const roles = ['super-admin', 'content_editor', 'api:user'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roles);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roles);
      expect(decorator).toBe(mockDecorator);
    });

    it('should preserve order of roles', () => {
      const roles = ['third', 'first', 'second'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roles);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roles);
      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });

    it('should handle duplicate roles', () => {
      const roles = ['admin', 'admin', 'user'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roles);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roles);
      expect(decorator).toBe(mockDecorator);
    });

    it('should work with string array spread', () => {
      const roleArray = ['viewer', 'editor'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roleArray);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roleArray);
      expect(decorator).toBe(mockDecorator);
    });

    it('should handle empty strings in roles', () => {
      const roles = ['admin', '', 'user'];
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(...roles);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, roles);
      expect(decorator).toBe(mockDecorator);
    });

    it('should handle long role names', () => {
      const longRoleName = 'super-administrator-with-full-access-permissions';
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      const decorator = Role(longRoleName);

      expect(mockSetMetadata).toHaveBeenCalledWith(ROLE_KEY, [longRoleName]);
      expect(decorator).toBe(mockDecorator);
    });

    it('should be called only once per decorator creation', () => {
      const role = 'admin';
      const mockDecorator = jest.fn();
      // @ts-ignore
      mockSetMetadata.mockReturnValue(mockDecorator);

      Role(role);

      expect(mockSetMetadata).toHaveBeenCalledTimes(1);
    });
  });
});
