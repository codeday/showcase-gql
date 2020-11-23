export interface AuthToken {
  /** Username. */
  u?: string

  /** EventId for newly created projects. (If null user cannot create projects.) */
  e?: string

  /** EventGroupId for newly created projects. */
  g?: string

  /** RegionId for newly created projects. */
  r?: string

  /** ProgramId for newly created projects. */
  p?: string

  /** Can edit, feature, and award all projects in the specified EventId. */
  a: boolean
}
