import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../../../entities/user.entity';
import * as fs from 'node:fs';
import { UserRoles } from '../../../enums/userRoles';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should throw an error if email or password is missing', async () => {
      await expect(
        authService.login({ email: '', password: '' } as LoginDto),
      ).rejects.toThrow(
        new HttpException(
          'Email and password are required',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if the user is not found', async () => {
      // @ts-ignore
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(null);
      await expect(
        authService.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an error if passwords do not match', async () => {
      const user = { hashed_password: 'hashed' } as User;
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(user);
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);
      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return tokens if login is successful', async () => {
      const user = { hashed_password: 'hashed' } as User;
      jest.spyOn(userService, 'findUserByEmail').mockResolvedValueOnce(user);
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);
      // @ts-ignore
      jest.spyOn(authService, 'getTokens').mockResolvedValueOnce({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await authService.login({
        email: 'test@test.com',
        password: 'password',
      });
      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw an error if refresh token is missing', async () => {
      await expect(authService.refreshToken('')).rejects.toThrow(
        new HttpException('Refresh token is required', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an error if refresh token is invalid', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('invalid'));

      await expect(authService.refreshToken('invalidToken')).rejects.toThrow(
        new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce({ uuid: '123' });
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(null);

      await expect(authService.refreshToken('validToken')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should return new tokens if refresh token is valid', async () => {
      const user = {} as User;
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce({ uuid: '123' });
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(user);
      // @ts-ignore
      jest.spyOn(authService, 'getTokens').mockResolvedValueOnce({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const result = await authService.refreshToken('validToken');
      expect(result).toEqual({
        accessToken: 'access',
        refreshToken: 'refresh',
      });
    });
  });

  describe('verifyAccessToken', () => {
    it('should throw an error if token is missing', () => {
      expect(() => authService.verifyAccessToken('')).toThrow(
        new HttpException('Access token is required', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw an error if token is invalid', () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid');
      });

      expect(() => authService.verifyAccessToken('invalidToken')).toThrow(
        new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should return the decoded token if it is valid', () => {
      const decoded = { id: 1 };
      jest.spyOn(jwtService, 'verify').mockReturnValueOnce(decoded);

      const result = authService.verifyAccessToken('validToken');
      expect(result).toEqual(decoded);
    });
  });

  describe('getTokens', () => {
    // Mock pliku z kluczami
    beforeEach(() => {
      jest.spyOn(fs, 'readFileSync').mockImplementation((path) => {
        if (path === 'private.key') return Buffer.from('mock-private-key');
        if (path === 'public.pem') return Buffer.from('mock-public-key');
        throw new Error('File not found');
      });
    });

    it('should generate refresh and access tokens with correct payload', async () => {
      // Przygotuj mockowego użytkownika
      const mockUser = {
        id: 1,
        uuid: 'test-uuid',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'OFFICER' as UserRoles,
        default_site: null,
        other_sites: [],
      } as unknown as User;

      // Zmockuj signAsync, aby zwracał przewidywane tokeny
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('mock-refresh-token')
        .mockResolvedValueOnce('mock-access-token');

      // Użyj refleksji, aby wywołać prywatną metodę
      const result = await (authService as any).getTokens(mockUser);

      // Sprawdź rezultat
      expect(result).toEqual({
        refreshToken: 'mock-refresh-token',
        accessToken: 'mock-access-token',
      });

      // Sprawdź wywołania signAsync
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);

      // Sprawdź payload i opcje tokena refresh
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          id: mockUser.id,
          uuid: mockUser.uuid,
        },
        {
          privateKey: expect.any(Buffer),
          algorithm: 'RS256',
          expiresIn: '24h',
        },
      );

      // Sprawdź payload i opcje tokena access
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          id: mockUser.id,
          uuid: mockUser.uuid,
          email: mockUser.email,
          role: mockUser.role,
          firstName: mockUser.first_name,
          lastName: mockUser.last_name,
          default_site: mockUser.default_site,
          other_sites: mockUser.other_sites,
        },
        {
          privateKey: expect.any(Buffer),
          algorithm: 'RS512',
          expiresIn: '1h',
        },
      );
    });
  });
});
