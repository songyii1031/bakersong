import { Star } from "lucide-react";

export default function StarRating({
  rating,
  size = 16,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  const filled = Math.round(rating);

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < filled ? "fill-pink-point text-pink-point" : "text-pink-sub"}
        />
      ))}
    </div>
  );
}
