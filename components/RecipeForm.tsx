"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildRecipePhotoPath, RECIPE_PHOTOS_BUCKET } from "@/lib/supabase/storage";
import { CATEGORIES, DIFFICULTIES } from "@/lib/constants";
import type { ContentBlock, Recipe } from "@/lib/types";
import CategoryChips from "./CategoryChips";
import PhotoUploader from "./PhotoUploader";
import ContentBlockEditor, { type EditableBlock } from "./ContentBlockEditor";

type Props =
  | {
      mode: "new";
      recipe?: undefined;
      initialPhotoUrl?: undefined;
      initialBlocks?: undefined;
    }
  | {
      mode: "edit";
      recipe: Recipe;
      initialPhotoUrl: string | null;
      initialBlocks: { block: ContentBlock; photoUrl: string | null }[];
    };

function toEditableBlocks(
  initialBlocks: { block: ContentBlock; photoUrl: string | null }[]
): EditableBlock[] {
  return initialBlocks.map(({ block, photoUrl }) => ({
    key: block.id,
    type: block.block_type,
    text: block.text_content ?? "",
    textAlign: block.text_align,
    fontSize: block.font_size,
    bold: block.bold,
    bgColor: block.bg_color,
    photoFile: null,
    existingPhotoPath: block.photo_url,
    previewUrl: block.block_type === "image" ? photoUrl : null,
  }));
}

export default function RecipeForm({ mode, recipe, initialPhotoUrl, initialBlocks }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [category, setCategory] = useState(
    recipe?.category ?? CATEGORIES[CATEGORIES.length - 1]
  );
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? DIFFICULTIES[1]);
  const [cookTime, setCookTime] = useState(recipe?.cook_time?.toString() ?? "");
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? "");
  const [memo, setMemo] = useState(recipe?.memo ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl ?? null);
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    initialBlocks ? toEditableBlocks(initialBlocks) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요해요.");
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      category,
      difficulty,
      cook_time: cookTime ? Number(cookTime) : null,
      servings: servings ? Number(servings) : null,
      memo: memo.trim() || null,
    };

    try {
      let recipeId = recipe?.id;

      if (mode === "new") {
        const { data, error: insertError } = await supabase
          .from("recipes")
          .insert({ ...payload, user_id: user.id })
          .select("id")
          .single();
        if (insertError || !data) throw insertError ?? new Error("insert failed");
        recipeId = data.id;
      } else {
        const { error: updateError } = await supabase
          .from("recipes")
          .update(payload)
          .eq("id", recipeId!);
        if (updateError) throw updateError;
      }

      if (!recipeId) throw new Error("no recipe id");

      if (photoFile) {
        const path = buildRecipePhotoPath(user.id, recipeId, photoFile.name);
        const { error: uploadError } = await supabase.storage
          .from(RECIPE_PHOTOS_BUCKET)
          .upload(path, photoFile);
        if (uploadError) throw uploadError;

        const { error: photoUpdateError } = await supabase
          .from("recipes")
          .update({ main_photo_url: path })
          .eq("id", recipeId);
        if (photoUpdateError) throw photoUpdateError;

        const oldPath = recipe?.main_photo_url;
        if (oldPath && oldPath !== path) {
          await supabase.storage.from(RECIPE_PHOTOS_BUCKET).remove([oldPath]);
        }
      }

      // 콘텐츠 블록 업로드 + 행 구성
      const blockRows: {
        block_type: "text" | "image";
        text_content: string | null;
        photo_url: string | null;
        text_align: string;
        font_size: string;
        bold: boolean;
        bg_color: string | null;
      }[] = [];
      for (const block of blocks) {
        if (block.type === "text") {
          if (!block.text.trim()) continue;
          blockRows.push({
            block_type: "text",
            text_content: block.text.trim(),
            photo_url: null,
            text_align: block.textAlign,
            font_size: block.fontSize,
            bold: block.bold,
            bg_color: block.bgColor,
          });
        } else {
          let photoPath = block.existingPhotoPath;
          if (block.photoFile) {
            const path = buildRecipePhotoPath(user.id, recipeId, block.photoFile.name);
            const { error: uploadError } = await supabase.storage
              .from(RECIPE_PHOTOS_BUCKET)
              .upload(path, block.photoFile);
            if (uploadError) throw uploadError;
            photoPath = path;
          }
          if (!photoPath) continue;
          blockRows.push({
            block_type: "image",
            text_content: null,
            photo_url: photoPath,
            text_align: block.textAlign,
            font_size: block.fontSize,
            bold: block.bold,
            bg_color: block.bgColor,
          });
        }
      }

      // 수정 모드: 기존 블록 삭제 후 재삽입 (더 이상 쓰이지 않는 사진은 스토리지에서도 정리)
      if (mode === "edit") {
        const keptPaths = new Set(blockRows.map((b) => b.photo_url).filter(Boolean));
        const orphanPaths = (initialBlocks ?? [])
          .map(({ block }) => block.photo_url)
          .filter((p): p is string => Boolean(p) && !keptPaths.has(p));
        if (orphanPaths.length > 0) {
          await supabase.storage.from(RECIPE_PHOTOS_BUCKET).remove(orphanPaths);
        }
        await supabase.from("content_blocks").delete().eq("recipe_id", recipeId);
      }

      if (blockRows.length > 0) {
        const { error: blocksError } = await supabase.from("content_blocks").insert(
          blockRows.map((b, index) => ({ ...b, recipe_id: recipeId, sort_order: index }))
        );
        if (blocksError) throw blocksError;
      }

      router.push(`/recipes/${recipeId}`);
      router.refresh();
    } catch {
      setError("저장 중 문제가 생겼어요. 다시 시도해주세요.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!recipe) return;
    setDeleting(true);
    const supabase = createClient();

    const photoPaths = [
      recipe.main_photo_url,
      ...blocks
        .filter((b) => b.type === "image" && b.existingPhotoPath)
        .map((b) => b.existingPhotoPath),
    ].filter((p): p is string => Boolean(p));

    if (photoPaths.length > 0) {
      await supabase.storage.from(RECIPE_PHOTOS_BUCKET).remove(photoPaths);
    }

    const { error: deleteError } = await supabase.from("recipes").delete().eq("id", recipe.id);
    if (deleteError) {
      setError("삭제 중 문제가 생겼어요.");
      setDeleting(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-brown-text">
        {mode === "new" ? "새 레시피 굽기" : "레시피 수정"}
      </h1>

      <PhotoUploader
        previewUrl={previewUrl}
        label="대표 사진 올리기"
        onSelect={(file) => {
          setPhotoFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm text-brown-text/70">제목 *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예) 폭신 마카롱"
          className="w-full rounded-full border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none focus:border-pink-point"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-brown-text/70">카테고리</span>
        <CategoryChips categories={CATEGORIES} selected={category} onSelect={setCategory} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-brown-text/70">난이도</span>
        <CategoryChips categories={DIFFICULTIES} selected={difficulty} onSelect={setDifficulty} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-brown-text/70">조리시간(분)</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            className="w-full rounded-full border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none focus:border-pink-point"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-brown-text/70">인분</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-full border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none focus:border-pink-point"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-brown-text/70">레시피 이야기</span>
        <ContentBlockEditor blocks={blocks} onChange={setBlocks} />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-brown-text/70">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          className="w-full rounded-[18px] border-[1.5px] border-pink-sub bg-cream px-5 py-3 text-base text-brown-text shadow-cookie-inset outline-none focus:border-pink-point"
        />
      </div>

      {error && <p className="text-center text-sm text-pink-deep">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-press w-full rounded-full bg-pink-point py-3 font-heading text-lg text-cream shadow-cookie-btn disabled:opacity-60"
      >
        {loading ? "저장 중..." : "저장하기"}
      </button>

      {mode === "edit" && (
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-pink-sub bg-cream py-3 text-sm text-pink-deep"
        >
          <Trash2 className="h-4 w-4" />
          레시피 삭제하기
        </button>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brown-text/40 px-6">
          <div className="w-full max-w-sm rounded-[18px] bg-cream p-6 shadow-cookie-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg text-brown-text">정말 삭제할까요?</h2>
              <button type="button" onClick={() => setShowDeleteConfirm(false)}>
                <X className="h-5 w-5 text-brown-text/60" />
              </button>
            </div>
            <p className="mb-6 text-sm text-brown-text/70">
              삭제하면 되돌릴 수 없어요. 재료와 요리 단계도 함께 사라져요.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-press flex-1 rounded-full border-[1.5px] border-pink-sub bg-cream py-3 text-sm text-brown-text"
              >
                취소
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="btn-press flex-1 rounded-full bg-pink-point py-3 text-sm text-cream shadow-cookie-btn disabled:opacity-60"
              >
                {deleting ? "삭제 중..." : "삭제하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
