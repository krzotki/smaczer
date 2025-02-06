import { AddRecipeForm } from "@/components/AddRecipeForm";
import { AddRecipeFullForm } from "@/components/AddRecipeFullForm";
import { AppLayout } from "@/components/AppLayout";
import { Header } from "@/components/Header";

export default async function AddRecipe() {
  return (
    <AppLayout header={<Header />}>
      <AddRecipeForm />
      <AddRecipeFullForm />
    </AppLayout>
  );
}
