import Link from "next/link";
import Image from "next/image";
import { ChefHat } from "lucide-react";
import StarRating from "./StarRating";

type CardRecipe = {
  id: string;
  title: string;
  cook_time: number | null;
  rating: number | null;
};

export default function RecipeCard({
  recipe,
  photoUrl,
}: {
  recipe: CardRecipe;
  photoUrl: string | null;
}) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col overflow-hidden rounded-[18px] bg-white shadow-cookie-card"
    >
      <div className="relative aspect-square w-full bg-beige-cookie">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 640px) 50vw, 300px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ChefHat className="h-10 w-10 text-pink-deep/40" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 font-heading text-base text-brown-text">
          {recipe.title}
        </p>
        <div className="flex items-center justify-between text-xs text-brown-text/60">
          <span>{recipe.cook_time ? `⏱ ${recipe.cook_time}분` : ""}</span>
          <StarRating rating={recipe.rating ?? 0} size={12} />
        </div>
      </div>
    </Link>
  );
}
