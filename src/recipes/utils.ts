import { RecipeType } from "./types";

export const ingredientsToString = (recipe: RecipeType) =>
  recipe.ingredients
    .map(({ items }) => items.map((item) => item.name).join("\n"))
    .join("\n");
