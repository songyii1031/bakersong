export const CATEGORIES = [
  "한식",
  "양식",
  "중식",
  "일식",
  "디저트",
  "간식",
  "음료",
  "기타",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const TEXT_ALIGNS = ["left", "center", "right"] as const;
export type TextAlign = (typeof TEXT_ALIGNS)[number];

export const FONT_SIZES = ["sm", "md", "lg"] as const;
export type FontSize = (typeof FONT_SIZES)[number];
export const FONT_SIZE_LABELS: Record<FontSize, string> = {
  sm: "작게",
  md: "보통",
  lg: "크게",
};
export const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const BLOCK_BG_COLORS = ["pink-soft", "pink-sub", "beige-cookie"] as const;
export type BlockBgColor = (typeof BLOCK_BG_COLORS)[number];
export const BLOCK_BG_COLOR_LABELS: Record<BlockBgColor, string> = {
  "pink-soft": "핑크",
  "pink-sub": "진핑크",
  "beige-cookie": "베이지",
};
export const BLOCK_BG_COLOR_CLASSES: Record<BlockBgColor, string> = {
  "pink-soft": "bg-pink-soft",
  "pink-sub": "bg-pink-sub",
  "beige-cookie": "bg-beige-cookie",
};
