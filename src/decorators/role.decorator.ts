import { SetMetadata } from '@nestjs/common';

/**
 * A constant holding the key used to represent roles in a data object or system.
 * This key can be used to fetch, store, or manage assigned roles in an application.
 */

export const ROLE_KEY = 'roles';
/**
 * A decorator function used to assign roles to a particular method or class.
 * This function utilizes the SetMetadata function to attach metadata for role-based access control.
 *
 * @param {...string} role - A list of roles to be assigned. Accepts multiple string arguments representing the roles.
 * @returns {Function} - A decorator function that stores the roles in metadata to be used by the application.
 */
export const Role = (...role: string[]): Function =>
  SetMetadata(ROLE_KEY, role);
