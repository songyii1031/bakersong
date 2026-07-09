"use client";

import {
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Palette,
} from "lucide-react";
import {
  TEXT_ALIGNS,
  FONT_SIZES,
  FONT_SIZE_LABELS,
  FONT_SIZE_CLASSES,
  BLOCK_BG_COLORS,
  BLOCK_BG_COLOR_CLASSES,
  type TextAlign,
  type FontSize,
  type BlockBgColor,
} from "@/lib/constants";
import PhotoUploader from "./PhotoUploader";

export type EditableBlock = {
  key: string;
  type: "text" | "image";
  text: string;
  textAlign: TextAlign;
  fontSize: FontSize;
  bold: boolean;
  bgColor: BlockBgColor | null;
  photoFile: File | null;
  existingPhotoPath: string | null;
  previewUrl: string | null;
};

export function createTextBlock(): EditableBlock {
  return {
    key: crypto.randomUUID(),
    type: "text",
    text: "",
    textAlign: "left",
    fontSize: "md",
    bold: false,
    bgColor: null,
    photoFile: null,
    existingPhotoPath: null,
    previewUrl: null,
  };
}

export function createImageBlock(): EditableBlock {
  return {
    key: crypto.randomUUID(),
    type: "image",
    text: "",
    textAlign: "left",
    fontSize: "md",
    bold: false,
    bgColor: null,
    photoFile: null,
    existingPhotoPath: null,
    previewUrl: null,
  };
}

const ALIGN_ICONS: Record<TextAlign, typeof AlignLeft> = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
};

export default function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: EditableBlock[];
  onChange: (blocks: EditableBlock[]) => void;
}) {
  function updateBlock(key: string, patch: Partial<EditableBlock>) {
    onChange(blocks.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  }

  function removeBlock(key: string) {
    onChange(blocks.filter((b) => b.key !== key));
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <div key={block.key} className="relative rounded-[18px] bg-pink-soft p-3">
          <button
            type="button"
            onClick={() => removeBlock(block.key)}
            className="btn-press absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-cream shadow-cookie-btn"
          >
            <Trash2 className="h-4 w-4 text-pink-deep" />
          </button>

          {block.type === "text" ? (
            <div className="flex flex-col gap-2 pr-10">
              {/* 정렬 / 굵기 */}
              <div className="flex flex-wrap items-center gap-1">
                {TEXT_ALIGNS.map((align) => {
                  const Icon = ALIGN_ICONS[align];
                  return (
                    <button
                      key={align}
                      type="button"
                      onClick={() => updateBlock(block.key, { textAlign: align })}
                      className={`btn-press flex h-8 w-8 items-center justify-center rounded-full ${
                        block.textAlign === align
                          ? "bg-pink-point text-cream shadow-cookie-btn"
                          : "bg-cream text-brown-text/70"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => updateBlock(block.key, { bold: !block.bold })}
                  className={`btn-press flex h-8 w-8 items-center justify-center rounded-full ${
                    block.bold
                      ? "bg-pink-point text-cream shadow-cookie-btn"
                      : "bg-cream text-brown-text/70"
                  }`}
                >
                  <Bold className="h-4 w-4" />
                </button>
              </div>

              {/* 글자 크기 */}
              <div className="flex flex-wrap items-center gap-1">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateBlock(block.key, { fontSize: size })}
                    className={`btn-press rounded-full px-3 py-1 text-xs ${
                      block.fontSize === size
                        ? "bg-pink-point text-cream shadow-cookie-btn"
                        : "bg-cream text-brown-text/70"
                    }`}
                  >
                    {FONT_SIZE_LABELS[size]}
                  </button>
                ))}
              </div>

              {/* 배경색 */}
              <div className="flex flex-wrap items-center gap-1">
                <Palette className="h-4 w-4 text-brown-text/40" />
                <button
                  type="button"
                  onClick={() => updateBlock(block.key, { bgColor: null })}
                  className={`btn-press h-6 w-6 rounded-full border-2 bg-cream ${
                    block.bgColor === null ? "border-pink-point" : "border-pink-sub"
                  }`}
                  aria-label="배경색 없음"
                />
                {BLOCK_BG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateBlock(block.key, { bgColor: color })}
                    className={`btn-press h-6 w-6 rounded-full border-2 ${BLOCK_BG_COLOR_CLASSES[color]} ${
                      block.bgColor === color ? "border-pink-point" : "border-transparent"
                    }`}
                    aria-label={color}
                  />
                ))}
              </div>

              <textarea
                value={block.text}
                onChange={(e) => updateBlock(block.key, { text: e.target.value })}
                placeholder="이야기를 적어주세요..."
                rows={4}
                style={{ fontWeight: block.bold ? 700 : 400, textAlign: block.textAlign }}
                className={`w-full rounded-[14px] border-[1.5px] border-pink-sub px-4 py-3 text-brown-text shadow-cookie-inset outline-none focus:border-pink-point ${FONT_SIZE_CLASSES[block.fontSize]} ${
                  block.bgColor ? BLOCK_BG_COLOR_CLASSES[block.bgColor] : "bg-cream"
                }`}
              />
            </div>
          ) : (
            <PhotoUploader
              previewUrl={block.previewUrl}
              label="사진 올리기"
              aspectClassName="aspect-4/3"
              onSelect={(file) =>
                updateBlock(block.key, {
                  photoFile: file,
                  previewUrl: URL.createObjectURL(file),
                })
              }
            />
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange([...blocks, createTextBlock()])}
          className="btn-press flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-dashed border-pink-sub py-3 text-sm text-pink-deep"
        >
          <Type className="h-4 w-4" />
          글 추가
        </button>
        <button
          type="button"
          onClick={() => onChange([...blocks, createImageBlock()])}
          className="btn-press flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-dashed border-pink-sub py-3 text-sm text-pink-deep"
        >
          <ImageIcon className="h-4 w-4" />
          사진 추가
        </button>
      </div>

      {blocks.length === 0 && (
        <p className="text-center text-xs text-brown-text/50">
          <Plus className="mb-0.5 inline h-3 w-3" /> 글이나 사진을 추가해서 레시피 이야기를 자유롭게 남겨보세요
        </p>
      )}
    </div>
  );
}
