import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as fs from 'node:fs';
import { User } from '../../entities/user.entity';
import { Site } from '../../entities/site.entity';

jest.mock('argon2');
jest.mock('node:fs');

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: 1,
    uuid: 'test-uuid',
    email: 'test@example.com',
    first_name: 'Jan',
    last_name: 'Kowalski',
    hashed_password: 'hashedPassword',
    role: 'OFFICER',
    default_site: {
      id: 1,
      uuid: 'site-uuid',
      name: 'Test Site',
      address: 'Test Address',
      description: 'Test Description',
    } as Site,
    other_sites: [],
  } as unknown as User;

  const mockPrivateKey = Buffer.from('private-key');
  const mockPublicKey = Buffer.from('public-key');

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

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);

    // Mock file system
    (fs.readFileSync as jest.Mock).mockImplementation((path: string) => {
      if (path === 'private.key') return mockPrivateKey;
      if (path === 'public.pem') return mockPublicKey;
      return Buffer.from('');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('konstruktor', () => {
    it('powinien wczytać klucze prywatny i publiczny', () => {
      expect(fs.readFileSync).toHaveBeenCalledWith('private.key');
      expect(fs.readFileSync).toHaveBeenCalledWith('public.pem');
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('powinien pomyślnie zalogować użytkownika z prawidłowymi danymi', async () => {
      userService.findUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce('refreshToken');
      jwtService.signAsync.mockResolvedValueOnce('accessToken');

      const result = await service.login(validCredentials);

      expect(result).toEqual({
        refreshToken: 'refreshToken',
        accessToken: 'accessToken',
      });
      expect(userService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(argon2.verify).toHaveBeenCalledWith(
        'hashedPassword',
        'password123',
      );
    });

    it('powinien rzucić wyjątek gdy email nie został podany', async () => {
      const credentials = { email: '', password: 'password123' };

      await expect(service.login(credentials)).rejects.toThrow(
        new HttpException(
          'Email and password are required',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('powinien rzucić wyjątek gdy hasło nie zostało podane', async () => {
      const credentials = { email: 'test@example.com', password: '' };

      await expect(service.login(credentials)).rejects.toThrow(
        new HttpException(
          'Email and password are required',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('powinien rzucić wyjątek gdy użytkownik nie istnieje', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(service.login(validCredentials)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });

    it('powinien rzucić wyjątek gdy hasło jest nieprawidłowe', async () => {
      userService.findUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(validCredentials)).rejects.toThrow(
        new HttpException('Invalid email or password', HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('refreshToken', () => {
    const validRefreshToken = 'valid-refresh-token';

    it('powinien pomyślnie odświeżyć token', async () => {
      const payload = { id: 1, uuid: 'test-uuid' };
      jwtService.verifyAsync.mockResolvedValue(payload);
      userService.findOne.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce('newRefreshToken');
      jwtService.signAsync.mockResolvedValueOnce('newAccessToken');

      const result = await service.refreshToken(validRefreshToken);

      expect(result).toEqual({
        refreshToken: 'newRefreshToken',
        accessToken: 'newAccessToken',
      });
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(validRefreshToken, {
        publicKey: mockPublicKey,
        algorithms: ['RS256'],
      });
      expect(userService.findOne).toHaveBeenCalledWith('test-uuid');
    });

    it('powinien rzucić wyjątek gdy refresh token nie został podany', async () => {
      await expect(service.refreshToken('')).rejects.toThrow(
        new HttpException('Refresh token is required', HttpStatus.UNAUTHORIZED),
      );
    });

    it('powinien rzucić wyjątek gdy refresh token jest nieprawidłowy', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED),
      );
    });

    it('powinien rzucić wyjątek gdy użytkownik nie istnieje', async () => {
      const payload = { id: 1, uuid: 'test-uuid' };
      jwtService.verifyAsync.mockResolvedValue(payload);
      userService.findOne.mockResolvedValue(null);

      await expect(service.refreshToken(validRefreshToken)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('verifyPassword (prywatna metoda)', () => {
    it('powinien zweryfikować hasło przez wywołanie argon2.verify', async () => {
      userService.findUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('token');

      await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(argon2.verify).toHaveBeenCalledWith(
        'hashedPassword',
        'password123',
      );
    });
  });

  describe('obsługa błędów', () => {
    it('powinien propagować błędy z UserService', async () => {
      const error = new Error('Database error');
      userService.findUserByEmail.mockRejectedValue(error);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(error);
    });

    it('powinien propagować błędy z JwtService podczas generowania tokenów', async () => {
      userService.findUserByEmail.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockRejectedValue(new Error('JWT error'));

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow('JWT error');
    });
  });
  describe('verifyAccessToken', () => {
    const validToken = 'valid-access-token';
    const mockPayload = {
      id: 1,
      uuid: 'test-uuid',
      email: 'test@example.com',
      role: 'OFFICER',
      firstName: 'Jan',
      lastName: 'Kowalski',
      default_site: { id: 1, name: 'Test Site' },
    };

    it('powinien pomyślnie zweryfikować prawidłowy token', () => {
      jwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyAccessToken(validToken);

      expect(result).toEqual(mockPayload);
      expect(jwtService.verify).toHaveBeenCalledWith(validToken, {
        publicKey: mockPublicKey,
        algorithms: ['RS512'],
      });
    });

    it('powinien rzucić wyjątek gdy token jest nieprawidłowy', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyAccessToken(validToken)).toThrow(
        new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED),
      );
    });

    it('powinien rzucić wyjątek gdy token jest pusty', () => {
      expect(() => service.verifyAccessToken('')).toThrow(
        new HttpException('Access token is required', HttpStatus.UNAUTHORIZED),
      );
    });
  });
});
