/** Soft, friendly geometry — generous card corners and pill controls. */
export const radius = {
  xs: 6,
  sm: 8,
  md: 14,
  base: 16,
  card: 22,
  lg: 24,
  xl: 32,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;
