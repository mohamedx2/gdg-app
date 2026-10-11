/** 8px base grid (4px sub-grid for icons and badges). */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  /** Default outer edge inset of the mobile canvas. */
  gutter: 16,
} as const;

export type SpacingToken = keyof typeof spacing;
