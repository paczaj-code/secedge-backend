/**
 * Enumeration representing the different roles within a system.
 * Each role is associated with a specific numeric value and represents
 * a level of authority or responsibility.
 *
 * - OFFICER: Represents a general officer role in the system.
 * - SHIFT_SUPERVISOR: Denotes the role responsible for supervising shifts.
 * - TEAM_LEADER: Identifies the role of a leader managing a specific team.
 * - ADMIN: Represents an administrative role with advanced permissions.
 * - SUPER_ADMIN: The highest-level role with full system access and controls.
 */
export enum Role {
  OFFICER = 1,
  SHIFT_SUPERVISOR = 2,
  TEAM_LEADER = 3,
  ADMIN = 4,
  SUPER_ADMIN,
}
