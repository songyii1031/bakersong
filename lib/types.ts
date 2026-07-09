export type Recipe = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  difficulty: string;
  cook_time: number | null;
  servings: number | null;
  rating: number | null;
  is_favorite: boolean;
  memo: string | null;
  main_photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentBlock = {
  id: string;
  recipe_id: string;
  sort_order: number;
  block_type: "text" | "image";
  text_content: string | null;
  photo_url: string | null;
  text_align: "left" | "center" | "right";
  font_size: "sm" | "md" | "lg";
  bold: boolean;
  bg_color: "pink-soft" | "pink-sub" | "beige-cookie" | null;
};
