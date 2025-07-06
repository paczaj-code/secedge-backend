import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { User } from '../../entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as fs from 'node:fs';
import { UserRoles } from '../../enums/userRoles';
import { JwtService } from '@nestjs/jwt';
import { Site } from '../../entities/site.entity';

interface AccessTokenPayload {
  id: number;
  uuid: string;
  email: string;
  role: UserRoles;
  firstName: string;
  lastName: string;
  default_site: Site;
  other_sites?: Site[];
}

interface RefreshTokenPayload {
  id: number;
  uuid: string;
}

/**
 * AuthService handles user authentication and authorization tasks, including user login,
 * token generation, token validation, and refreshing tokens.
 */
@Injectable()
export class AuthService {
  private readonly privateKey: Buffer;
  private readonly publicKey: Buffer;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    this.privateKey = fs.readFileSync('private.key');
    this.publicKey = fs.readFileSync('public.pem');
  }

  /**
   * Authenticates a user and returns a pair of tokens (refreshToken and accessToken).
   *
   * @param {LoginDto} credentials - The login credentials containing the email and password.
   * @returns {Promise<{ refreshToken: string; accessToken: string }>} A promise that resolves to an object containing the refresh token and access token.
   * @throws {HttpException} If email or password is missing, or if credentials are invalid.
   */
  async login(
    credentials: LoginDto,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    if (!credentials.email || !credentials.password) {
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userService.findUserByEmail(credentials.email);

    if (
      !user ||
      !(await this.verifyPassword(credentials.password, user.hashed_password))
    ) {
      throw new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return this.getTokens(user);
  }

  /**
   * Verifies if the provided password matches the hashed password.
   *
   * @param {string} password - The plain text password to verify.
   * @param {string} hashed_password - The hashed password to compare against.
   * @return {Promise<boolean>} A promise that resolves to true if the password matches the hash, otherwise false.
   */
  private async verifyPassword(
    password: string,
    hashed_password: string,
  ): Promise<boolean> {
    return await argon2.verify(hashed_password, password);
  }

  /**
   * Refreshes and generates a new set of tokens based on the provided refresh token.
   *
   * @param {string} refreshToken - The refresh token used to verify and generate new tokens.
   * @return {Promise<object>} Returns a promise that resolves to an object containing the new set of tokens.
   * @throws {HttpException} Throws an exception if the refresh token is missing, invalid, or if the associated user cannot be found.
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    if (!refreshToken) {
      throw new HttpException(
        'Refresh token is required',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.userService.findOne(payload.uuid);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return this.getTokens(user);
  }

  /**
   * Generates a pair of tokens (refresh token and access token) for the provided user.
   *
   * @param {User} user - The user object containing user details required for token generation.
   * @return {Promise<{refreshToken: string, accessToken: string}>} A promise that resolves to an object containing the generated refresh token and access token.
   */
  private async getTokens(
    user: User,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const refreshTokenPayload: RefreshTokenPayload = {
      id: user.id,
      uuid: user.uuid,
    };
    const accessTokenPayload: AccessTokenPayload = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      default_site: user.default_site,
      other_sites: user.other_sites,
    };

    const [refreshToken, accessToken] = await Promise.all([
      this.jwtService.signAsync(refreshTokenPayload, {
        privateKey: this.privateKey,
        algorithm: 'RS256',
        expiresIn: '24h',
      }),
      this.jwtService.signAsync(accessTokenPayload, {
        privateKey: this.privateKey,
        algorithm: 'RS512',
        expiresIn: '1h',
      }),
    ]);

    return { refreshToken, accessToken };
  }

  /**
   * Verifies the provided access token to ensure its validity and authenticity.
   *
   * @param {string} token - The access token to be verified.
   * @return {object} Returns the decoded data from the verified token if valid.
   * @throws {HttpException} Throws an exception if the token is missing or invalid.
   */
  verifyAccessToken(token: string): object | HttpException {
    if (!token) {
      throw new HttpException(
        'Access token is required',
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      return this.jwtService.verify(token, {
        publicKey: this.publicKey,
        algorithms: ['RS256'],
      });
    } catch (error) {
      throw new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED);
    }
  }
}
