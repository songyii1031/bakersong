import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/supabase/photo-url";
import RecipeCard from "@/components/RecipeCard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,title,cook_time,rating,main_photo_url")
    .order("created_at", { ascending: false });

  const photoUrlMap = await getSignedPhotoUrls(
    supabase,
    (recipes ?? []).map((r) => r.main_photo_url)
  );

  return (
    <main className="flex-1 px-4 pb-10 pt-6">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl text-pink-point">송's 레시피북 🥨</h1>
          <p className="mt-1 text-sm text-brown-text/70">오늘은 뭘 구워볼까요?</p>
        </div>
        <Link
          href="/settings"
          className="btn-press flex h-10 w-10 items-center justify-center rounded-full bg-pink-soft shadow-cookie-btn"
        >
          <Settings className="h-5 w-5 text-pink-deep" />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {recipes?.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            photoUrl={
              recipe.main_photo_url ? photoUrlMap.get(recipe.main_photo_url) ?? null : null
            }
          />
        ))}

        <Link
          href="/recipes/new"
          className="btn-press flex aspect-square flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-pink-sub text-pink-deep"
        >
          <Plus className="h-8 w-8" />
          <span className="font-heading text-sm">새 레시피 굽기</span>
        </Link>
      </div>
    </main>
  );
}
