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

  private async verifyPassword(password: string, hashed_password: string) {
    return await argon2.verify(hashed_password, password);
  }

  async refreshToken(refreshToken: string) {
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

  private async getTokens(user: User) {
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
}
