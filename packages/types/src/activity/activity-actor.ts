/** Aggregated on the server for list / feed (no i18n here — labels are applied in UI). */
export type ActivityActorDisplay =
  | { kind: "system" }
  | { kind: "user"; userId: string; name: string }
  | { kind: "customer"; customerId: string; name: string; isDeleted?: boolean };
