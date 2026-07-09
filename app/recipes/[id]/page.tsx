import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChefHat, ChevronLeft, SquarePen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrl, getSignedPhotoUrls } from "@/lib/supabase/photo-url";
import StarRating from "@/components/StarRating";
import { FONT_SIZE_CLASSES, BLOCK_BG_COLOR_CLASSES, type FontSize, type BlockBgColor } from "@/lib/constants";

export default async function RecipeDetailPage({
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

  return (
    <main className="flex-1 pb-10">
      <div className="relative aspect-4/3 w-full bg-beige-cookie">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={recipe.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ChefHat className="h-16 w-16 text-pink-deep/30" />
          </div>
        )}
        <Link
          href="/"
          className="btn-press absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-cookie-btn"
        >
          <ChevronLeft className="h-5 w-5 text-brown-text" />
        </Link>
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="btn-press absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 shadow-cookie-btn"
        >
          <SquarePen className="h-5 w-5 text-brown-text" />
        </Link>
      </div>

      <div className="px-5 pt-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-block rounded-full bg-pink-soft px-3 py-1 text-xs text-pink-deep">
            {recipe.category}
          </span>
          <span className="inline-block rounded-full bg-pink-soft px-3 py-1 text-xs text-pink-deep">
            난이도 {recipe.difficulty}
          </span>
        </div>
        <h1 className="mt-2 font-heading text-2xl text-brown-text">{recipe.title}</h1>

        <div className="mt-3 flex items-center gap-4 text-sm text-brown-text/70">
          {recipe.cook_time != null && <span>⏱ {recipe.cook_time}분</span>}
          {recipe.servings != null && <span>🍽 {recipe.servings}인분</span>}
          <StarRating rating={recipe.rating ?? 0} size={16} />
        </div>

        {blocks && blocks.length > 0 && (
          <section className="mt-6 flex flex-col gap-4">
            {blocks.map((block) =>
              block.block_type === "text" ? (
                <p
                  key={block.id}
                  style={{
                    fontWeight: block.bold ? 700 : 400,
                    textAlign: block.text_align as "left" | "center" | "right",
                  }}
                  className={`whitespace-pre-wrap leading-relaxed text-brown-text ${
                    FONT_SIZE_CLASSES[block.font_size as FontSize]
                  } ${
                    block.bg_color
                      ? `rounded-[14px] p-3 ${BLOCK_BG_COLOR_CLASSES[block.bg_color as BlockBgColor]}`
                      : ""
                  }`}
                >
                  {block.text_content}
                </p>
              ) : block.photo_url && blockPhotoUrlMap.get(block.photo_url) ? (
                <div
                  key={block.id}
                  className="relative aspect-4/3 w-full overflow-hidden rounded-[18px] bg-beige-cookie"
                >
                  <Image
                    src={blockPhotoUrlMap.get(block.photo_url)!}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ) : null
            )}
          </section>
        )}

        {recipe.memo && (
          <section className="mt-6 rounded-[18px] bg-pink-soft p-4">
            <h2 className="mb-2 font-heading text-sm text-pink-deep">메모</h2>
            <p className="whitespace-pre-wrap text-sm text-brown-text">{recipe.memo}</p>
          </section>
        )}
      </div>
    </main>
  );
}
