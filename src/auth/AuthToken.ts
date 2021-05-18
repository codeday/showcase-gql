export interface AuthToken {
  /** Username. */
  u?: string

  /** Alias for username */
  sub?: string

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

  /** Judging Pool ID; if set the user can judge projects in this pool. */
  j?: string

  /** If true, and a judging pool is assigned, the user can view the results. */
  jvr?: boolean

  /** If true, and a judging pool is assigned, the user can upload Judges' media. */
  jum?: boolean
}
