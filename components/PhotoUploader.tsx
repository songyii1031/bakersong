"use client";

import Image from "next/image";
import { ChefHat } from "lucide-react";

export default function PhotoUploader({
  previewUrl,
  onSelect,
  label = "사진 올리기",
  aspectClassName = "aspect-4/3",
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void;
  label?: string;
  aspectClassName?: string;
}) {
  return (
    <label
      className={`relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[18px] border-2 border-dashed border-pink-sub bg-pink-soft ${aspectClassName}`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt={label}
          fill
          className="object-cover"
          unoptimized={previewUrl.startsWith("blob:")}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-pink-deep">
          <ChefHat className="h-8 w-8" />
          <span className="text-sm">{label}</span>
        </div>
      )}
    </label>
  );
}
