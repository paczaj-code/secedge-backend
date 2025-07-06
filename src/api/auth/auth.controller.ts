import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * Controller responsible for handling authentication-related requests.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles user login by validating credentials and providing access and refresh tokens.
   *
   * @param {LoginDto} credentials - Contains the properties required for user authentication, such as email and password.
   * @return {Promise<{ refreshToken: string; accessToken: string }>} A promise that resolves to an object containing the refresh token and access token for the authenticated user.
   */
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() credentials: LoginDto,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    return this.authService.login(credentials);
  }

  /**
   * Handles the refresh token functionality. Extracts the token from the request headers,
   * validates it, and calls the corresponding service to generate a new token.
   *
   * @param {Request} request - The HTTP request object containing the authorization header with the token.
   * @return {Promise<string>} Returns a promise that resolves to a newly refreshed token.
   * @throws {HttpException} Throws an exception if the token is missing or invalid.
   */
  @HttpCode(HttpStatus.OK)
  @Post('refreshToken')
  async refreshToken(
    @Req() request: Request,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token)
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    return this.authService.refreshToken(token);
  }
}
