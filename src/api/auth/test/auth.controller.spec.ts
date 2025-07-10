import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      // Act
      const result = await authController.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw an exception when AuthService.login throws', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };
      const expectedError = new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );

      mockAuthService.login.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(authController.login(loginDto)).rejects.toThrow(
        HttpException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should handle empty credentials', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: '',
        password: '',
      };
      const expectedError = new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );

      mockAuthService.login.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(authController.login(loginDto)).rejects.toThrow(
        HttpException,
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token with valid authorization header', async () => {
      // Arrange
      const validToken = 'valid-refresh-token';
      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      } as unknown as Request;

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      // Act
      const result = await authController.refreshToken(mockRequest);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(validToken);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UNAUTHORIZED when authorization header is missing', async () => {
      // Arrange
      const mockRequest = {
        headers: {},
      } as unknown as Request;

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when authorization header is malformed', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'InvalidFormat',
        },
      } as unknown as Request;

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when token is empty after Bearer prefix', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
      } as unknown as Request;

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should throw UNAUTHORIZED when Bearer prefix is missing', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'some-token-without-bearer',
        },
      } as unknown as Request;

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });

    it('should handle AuthService.refreshToken throwing an exception', async () => {
      // Arrange
      const validToken = 'expired-refresh-token';
      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      } as unknown as Request;

      const expectedError = new HttpException(
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );

      mockAuthService.refreshToken.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        HttpException,
      );
      expect(authService.refreshToken).toHaveBeenCalledWith(validToken);
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should handle case where token extraction returns undefined', async () => {
      // Arrange
      const mockRequest = {
        headers: {
          authorization: 'Bearer',
        },
      } as unknown as Request;

      // Act & Assert
      await expect(authController.refreshToken(mockRequest)).rejects.toThrow(
        new HttpException('Invalid token', HttpStatus.UNAUTHORIZED),
      );
      expect(authService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(authController).toBeDefined();
    });

    it('should have authService injected', () => {
      expect(authController['authService']).toBeDefined();
    });
  });
});
