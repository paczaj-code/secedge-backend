import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../api/auth/auth.service';
import { User } from '../entities/user.entity';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLE_KEY } from '../decorators/role.decorator';

/**
 * AuthorizationGuard is a guard that determines whether the current request is authorized
 * to access a specific route or resource. It verifies the presence and validity of an
 * authorization token, extracts user information, and checks if the user possesses
 * the required role for access.
 *
 * This guard uses dependency injection to access the `Reflector` and `AuthService`
 * provided by the application. It relies on metadata for role-based access control.
 *
 * Methods:
 *
 * - canActivate: The primary method executed to determine if a request can proceed.
 *   It extracts and verifies the token, retrieves the required role from metadata,
 *   and checks for authorization based on the user's decoded token and role.
 *
 * - extractToken: Internal method to extract the bearer token from the HTTP request's
 *   authorization header. Returns the token string or null if not present.
 *
 * - verifyToken: Internal method to verify the validity of the provided token using
 *   the `AuthService`. Decodes the token and attaches the user information to the
 *   request if valid. Returns the decoded user data or null if token is invalid.
 *
 * - getRequiredRole: Internal method to retrieve the role required for a specific
 *   route or handler. This is determined using metadata set on the route or class.
 *
 * - hasAuthorization: Internal method that evaluates whether the user's role meets
 *   or exceeds the required role for access. Returns true if the user is authorized,
 *   otherwise returns false.
 *
 * Dependencies:
 * - Reflector: Used to fetch metadata for role-based access control.
 * - AuthService: Provides token verification and manages authentication logic.
 */
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  /**
   * Determines whether the current request is authorized to activate a specific route.
   * This method validates the token, decodes it, checks its validity, and ensures
   * that the required role for the route is met by the decoded token.
   *
   * @param {ExecutionContext} context - The execution context object that provides details
   * about the current request, route handler, and other necessary metadata.
   * @return {boolean|Promise<boolean>|Observable<boolean>} A boolean, Promise resolving to a boolean,
   * or an Observable emitting a boolean indicating whether the request is authorized to proceed.
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) return false;

    const decodedToken = this.verifyToken(token, request);
    if (!decodedToken) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    const requiredRole = this.getRequiredRole(context);
    return this.hasAuthorization(decodedToken, requiredRole);
  }

  /**
   * Extracts the token from the authorization header of a request object.
   *
   * @param {any} request - The request object containing headers, typically from an HTTP request.
   * @return {string | null} The extracted token as a string if it exists, or null if the token is not present.
   */
  private extractToken(request: any): string | null {
    return request.headers.authorization?.split(' ')[1] ?? null;
  }

  /**
   * Verifies the provided token and associates the decoded user information with the given request object.
   *
   * @param {string} token - The token to be verified.
   * @param {any} request - The request object where the decoded user information will be assigned.
   * @return {Partial<User> | null} Decoded user information as a partial User object if the token is valid, otherwise null.
   */
  private verifyToken(token: string, request: any): Partial<User> | null {
    try {
      const decoded = this.authService.verifyAccessToken(token);
      if (!decoded) {
        return null; // Token is invalid or expired
      }
      request.user = decoded;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the required role for the given execution context by reflecting on metadata.
   *
   * @param {ExecutionContext} context - The execution context containing handler and class metadata.
   * @return {Role | null} The first required role if defined, or null if no roles are specified.
   */
  private getRequiredRole(context: ExecutionContext): Role | null {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return roles?.[0] || null;
  }

  /**
   * Checks whether the user has the required authorization based on their role.
   *
   * @param {Partial<User>} decodedToken - The decoded token object containing user information.
   * @param {Role | null} requiredRole - The role required for authorization. If null, all authenticated users are authorized.
   * @return {boolean} Returns true if the user has the required authorization, otherwise false.
   */
  private hasAuthorization(
    decodedToken: Partial<User>,
    requiredRole: Role | null,
  ): boolean {
    if (!requiredRole) return true; // Brak wymaganej roli oznacza dostęp dla wszystkich uwierzytelnionych
    if (!decodedToken.role) return false;

    return Role[decodedToken.role] >= Role[requiredRole];
  }
}
