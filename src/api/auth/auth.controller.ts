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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refreshToken')
  async refreshToken(@Req() request: Request) {
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token)
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    return this.authService.refreshToken(token);
  }
}
