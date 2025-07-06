import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';

/**
 * The AuthModule class is a feature module that provides authentication
 * and user-related services, controllers, and configurations.
 * It integrates with TypeORM for database management.
 *
 * Configuration includes:
 * - Controllers: Handles incoming requests and returns appropriate responses.
 * - Providers: Supplies service classes for implementing authentication logic.
 * - Imports: Integrates the module with TypeORM to handle database entities.
 * - Exports: Makes specific providers available for use in other modules.
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [AuthService, UserService],
})
export class AuthModule {}
