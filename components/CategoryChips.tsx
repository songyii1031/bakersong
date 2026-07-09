"use client";

export default function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`btn-press rounded-full px-4 py-2 text-sm ${
            selected === c
              ? "bg-pink-point text-cream shadow-cookie-btn"
              : "border-[1.5px] border-pink-sub bg-cream text-brown-text"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
