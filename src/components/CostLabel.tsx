import { RecipeType } from "@/recipes/types";
import { Box, Text } from "brainly-style-guide";
import css from "./CostLabel.module.scss";
import { RecipeListItem } from "@/recipes/getRecipes";

export const getCostColor = (cost: number) => {
  if (cost < 20) {
    return "green-40";
  }

  if (cost < 30) {
    return "yellow-40";
  }

  return "red-40";
};

export const transformCost = (cost: string) => {
  return `${Number(cost.trim()).toFixed(2).toString()} zł`;
};

export const CostLabel = ({ recipe }: { recipe: RecipeListItem }) => {
  const cost = (recipe.ingredientsCost || "").split("TOTAL_COST=")[1];
  const color = cost ? getCostColor(Number(cost)) : "gray-40";
  return (
    <Box padding="xs" color={color} className={css.costLabel}>
      <Text weight="bold" color="text-black" align="to-center">
        {cost ? transformCost(cost) : "???"}
      </Text>
    </Box>
  );
};
