/**
 * Represents the various roles a user can have within a system.
 *
 * This type is used to define and constrain the set of permissible roles,
 * ensuring only valid user roles are assigned or utilized throughout the
 * application.
 *
 * - 'VIEWER': A user with read-only access permissions.
 * - 'OFFICER': A user responsible for operational tasks within the system.
 * - 'SHIFT_SUPERVISOR': A user overseeing operational workflow during a specific shift.
 * - 'TEAM_LEADER': A user managing a specific team within the organization.
 * - 'ADMIN': A user with administrative rights and permissions.
 * - 'SUPER_ADMIN': A user with the highest level of system privileges.
 */
export type UserRoles =
  | 'VIEWER'
  | 'OFFICER'
  | 'SHIFT_SUPERVISOR'
  | 'TEAM_LEADER'
  | 'ADMIN'
  | 'SUPER_ADMIN';
