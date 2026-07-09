import type { SupabaseClient } from "@supabase/supabase-js";
import { RECIPE_PHOTOS_BUCKET } from "./storage";

const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1시간

export async function getSignedPhotoUrl(
  supabase: SupabaseClient,
  path: string | null
) {
  if (!path) return null;
  const { data } = await supabase.storage
    .from(RECIPE_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
  return data?.signedUrl ?? null;
}

export async function getSignedPhotoUrls(
  supabase: SupabaseClient,
  paths: (string | null)[]
) {
  const uniquePaths = Array.from(
    new Set(paths.filter((p): p is string => Boolean(p)))
  );
  const map = new Map<string, string>();
  if (uniquePaths.length === 0) return map;

  const { data } = await supabase.storage
    .from(RECIPE_PHOTOS_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_EXPIRES_IN);

  data?.forEach((item) => {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl);
  });

  return map;
}
