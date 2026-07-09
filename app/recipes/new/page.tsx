import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <main className="flex-1 px-5 pb-10 pt-6">
      <RecipeForm mode="new" />
    </main>
  );
}
