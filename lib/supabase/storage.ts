export const RECIPE_PHOTOS_BUCKET = "recipe-photos";

export function buildRecipePhotoPath(
  userId: string,
  recipeId: string,
  fileName: string
) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  return `${userId}/${recipeId}/${crypto.randomUUID()}.${ext}`;
}
