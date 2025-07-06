import { UserRoles } from '../../../enums/userRoles';
// This file defines the CreateUserDto class which is used to create a new user in the system.
// It includes properties such as firstName, lastName, email, phone, isInitPassword, role, defaultSiteId, isActive, otherSites, and creatorId.
// The UserRoles enum is imported to define the role of the user being created.

export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isInitPassword: boolean;
  role: UserRoles;
  defaultSiteId: number;
  isActive: boolean;
  otherSites: number[];
  creatorId?: number;
}
