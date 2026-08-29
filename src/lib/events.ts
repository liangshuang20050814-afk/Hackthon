export const EVENT_TYPES = ["Sports", "Party", "Study", "Social", "Gaming", "Other"] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export function isEventType(value: unknown): value is EventType {
  return typeof value === "string" && EVENT_TYPES.includes(value as EventType);
}
