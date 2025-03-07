"use client";

import { ingredientsToString } from "@/recipes/utils";
import { RecipeType } from "@/recipes/types";
import {
  Button,
  Flex,
  Icon,
  TextBit,
  Tooltip,
  Text,
} from "brainly-style-guide";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export const ExportShoppingListButton = ({
  recipes,
}: {
  recipes: RecipeType[];
}) => {
  const [loading, setLoading] = React.useState(false);
  const [exported, setExported] = React.useState(false);
  const params = useParams();

  const [progress, setProgress] = React.useState("");

  const sumProducts = async (currentSum: string, nextIngredients: string) => {
    const res = await fetch("/api/sum-ingredients", {
      method: "post",
      body: JSON.stringify({
        currentSum,
        nextIngredients,
      }),
    });
    const data = await res.json();
    return data.summed;
  };

  const classifyShoppingList = async (shoppingList: string) => {
    const res = await fetch("/api/classify-shopping-list", {
      method: "post",
      body: JSON.stringify({
        shoppingList,
      }),
    });
    const { classified, parsed } = await res.json();

    return { classified, parsed };
  };

  const handleClick = async () => {
    setLoading(true);

    const ingredients = recipes.map(ingredientsToString);

    let summed = ingredients[0];

    setProgress(`Sumowanie składników (1/${ingredients.length})`);

    for (let i = 1; i < ingredients.length; i++) {
      summed = await sumProducts(summed, ingredients[i]);
      setProgress(`Sumowanie składników (${i + 1}/${ingredients.length})`);
    }

    setProgress("Klasyfikowanie składników...");

    const { parsed, classified } = await classifyShoppingList(summed);

    setProgress("Exportowanie do arkusza...");

    const res = await fetch("/api/export-to-sheets", {
      method: "post",
      body: JSON.stringify({
        owner: params.userId,
        shoppingList: parsed,
      }),
    });
    const data = await res.json();

    setLoading(false);
    setExported(true);
  };

  return (
    <Flex
      justifyContent="center"
      margin="m"
      direction="column"
      alignItems="center"
    >
      {loading && (
        <Flex marginBottom="m">
          <TextBit size="small" color="text-white">
            {progress}
          </TextBit>
        </Flex>
      )}
      {!exported ? (
        <Button
          onClick={handleClick}
          variant="solid-inverted"
          disabled={loading}
          loading={loading}
        >
          Stwórz listę zakupów
        </Button>
      ) : (
        <Flex marginBottom="m">
          <TextBit size="small" color="text-green-40">
            Stworzono listę!
          </TextBit>
        </Flex>
      )}
      <Flex marginTop="m">
        <Link
          target="_blank"
          color="text-green-40"
          href="https://docs.google.com/spreadsheets/d/1-JiwaI8l943B6Wbqh4yCVRLPMqh2wwOc38hr2t1EG-I/edit#gid=0"
        >
          <Flex className="sg-space-x-xs">
            <Text color="text-white">Lista zakupów</Text>
            <Icon type="arrow_top_right" />
          </Flex>
        </Link>
      </Flex>
    </Flex>
  );
};
