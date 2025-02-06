"use client";

import { Box, Button, Flex, Headline } from "brainly-style-guide";
import React from "react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

import { NewRecipeType, RecipeEditor } from "./RecipeEditor";

export const EditRecipeForm = ({
  recipeToEdit,
}: {
  recipeToEdit: NewRecipeType;
}) => {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const [recipe, setRecipe] = React.useState<NewRecipeType>(recipeToEdit);

  const handleSubmit = React.useCallback(
    async (evt) => {
      evt.preventDefault();
      setLoading(true);
      const response = await fetch("/api/edit-recipe", {
        method: "PATCH",
        body: JSON.stringify({
          recipe,
        }),
      });

      const data = await response.json();

      if (data.insertedId) {
        setLoading(false);
        router.push(`/recipe/${data.insertedId}`, { scroll: false });
      }
    },
    [recipe, router]
  );

  console.log({recipe})

  return (
    <Flex marginTop="m" direction="column" gap="l" alignItems="center">
      <Headline size="large" color="text-white">
        Edytuj przepis
      </Headline>

      <RecipeEditor recipe={recipe} setRecipe={setRecipe} />
      <Button
        disabled={loading}
        loading={loading}
        onClick={handleSubmit}
        variant="solid-inverted"
      >
        Edytuj
      </Button>
    </Flex>
  );
};
