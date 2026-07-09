import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl, getSignedPhotoUrls } from "@/lib/supabase/photo-url";
import RecipeForm from "@/components/RecipeForm";
import type { ContentBlock } from "@/lib/types";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();

  const [photoUrl, { data: blocks }] = await Promise.all([
    getSignedPhotoUrl(supabase, recipe.main_photo_url),
    supabase
      .from("content_blocks")
      .select("*")
      .eq("recipe_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const blockPhotoUrlMap = await getSignedPhotoUrls(
    supabase,
    (blocks ?? []).map((b) => b.photo_url)
  );

  const initialBlocks = (blocks ?? []).map((block: ContentBlock) => ({
    block,
    photoUrl: block.photo_url ? blockPhotoUrlMap.get(block.photo_url) ?? null : null,
  }));

  return (
    <main className="flex-1 px-5 pb-10 pt-6">
      <RecipeForm
        mode="edit"
        recipe={recipe}
        initialPhotoUrl={photoUrl}
        initialBlocks={initialBlocks}
      />
    </main>
  );
}
