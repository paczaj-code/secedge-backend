import { CustomDecorator, SetMetadata } from '@nestjs/common';

/**
 * Represents the key used for storing or accessing permissions within a specific context,
 * such as application configuration, user roles, or access control mechanisms.
 *
 * The value assigned to this variable serves as a standardized reference for identifying or managing
 * permission-related data. Modifying this key may result in mismatched references or unintended behavior.
 */
export const PERMISSION_KEY = 'permissions';

/**
 * A decorator function that defines and assigns required permissions
 * to a specific handler or class in the application. This metadata
 * is typically used for authorization purposes, enabling the validation
 * of user permissions before executing the associated logic.
 *
 * @param {...string[]} permissions - The list of permission identifiers that
 * need to be fulfilled for the decorated handler or class.
 * @returns {Decorator} A decorator that sets the provided permissions
 * as metadata under the specified permission key.
 */
export const RequirePermissions = (...permissions: string[]): CustomDecorator =>
  SetMetadata(PERMISSION_KEY, permissions);
