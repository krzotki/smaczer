"use client";

import {
  Box,
  Button,
  Flex,
  Headline,
  Icon,
  Input,
  Label,
  SeparatorHorizontal,
  Spinner,
  Text,
  Textarea,
  TextBit,
} from "brainly-style-guide";
import React from "react";
import { useRouter } from "next/navigation";
import { revalidatePage } from "@/utils/revalidatePage";
import { useSession } from "next-auth/react";
import { RecipeType } from "@/recipes/types";
import Image from "next/image";
import { NewRecipeType, RecipeEditor } from "./RecipeEditor";

const defaultRecipe = {
  _id: '',
  id: Date.now(),
  name: "Nowy przepis",
  ingredients: [
    {
      items: [
        {
          name: "Mąka",
          id: "1",
        },
      ],
    },
  ],
  steps: [
    {
      description: "Krok 1",
      photoPath: "",
    },
  ],
  thumbnails: {
    xl: "",
  },
  photoPath: "",
};

export const AddRecipeFullForm = () => {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const [recipe, setRecipe] = React.useState<NewRecipeType>(defaultRecipe);

  const handleAddConfirmation = async (_id: string, owner?: string) => {
    const res = await fetch("/api/add-recipe-to-weekly", {
      method: "post",
      body: JSON.stringify({
        _id,
        owner,
      }),
    });
    const data = await res.json();

    if (data.acknowledged) {
      revalidatePage("/");
    }
  };

  const handleAdd = (_id: string) => {
    if (!session?.user?.sharedWithMe?.length) {
      return handleAddConfirmation(_id);
    }

    return handleAddConfirmation(_id, session.user.sharedWithMe[0].id);
  };

  const handleSubmit = React.useCallback(
    async (evt) => {
      evt.preventDefault();
      setLoading(true);
      const response = await fetch("/api/add-recipe-from-form", {
        method: "post",
        body: JSON.stringify({
          recipe,
        }),
      });

      const data = await response.json();

      if (data.insertedId) {
        await handleAdd(data.insertedId);
        setLoading(false);
        router.push(`/recipe/${data.insertedId}`, { scroll: false });
      }
    },
    [recipe, router]
  );

  return (
    <Flex marginTop="m" direction="column" gap="l" alignItems="center">
      <Headline size="large" color="text-white">
        Dodaj własne danie
      </Headline>

      <RecipeEditor recipe={recipe} setRecipe={setRecipe} />
      <Button
        disabled={loading}
        loading={loading}
        onClick={handleSubmit}
        variant="solid-inverted"
      >
        Dodaj przepis
      </Button>
    </Flex>
  );
};
