"use client";

import Image from "next/image";
import {
  Flex,
  Text,
  Headline,
  Button,
  CardButton,
  Box,
  Icon,
  TextBit,
  SeparatorHorizontal,
  Tooltip,
} from "brainly-style-guide";
import Link from "next/link";
import React from "react";
import { RecipeListItem } from "@/recipes/getRecipes";
import css from "./RecipesList.module.scss";
import { SearchForm } from "./SearchForm";
import { CostLabel } from "./CostLabel";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { revalidatePage } from "@/utils/revalidatePage";
import { RecipeRollOne } from "./RecipeRollOne";
import { useSession } from "next-auth/react";

const MAX_NAME_LENGTH = 30;

export const RecipesList = ({
  recipes,
  page,
  weeklyRecipes,
}: {
  recipes: RecipeListItem[];
  page?: number;
  weeklyRecipes?: boolean;
}) => {
  const { refresh } = useRouter();
  const currentPath = usePathname();
  const [loading, setLoading] = React.useState<string | undefined>(undefined);
  const query = useSearchParams();
  const { data: session } = useSession();

  const user = session?.user?.sharedWithMe;
  console.log({ user });

  const handleRemoveConfirmation = async (_id: string, owner?: string) => {
    setLoading(_id);
    const res = await fetch("/api/remove-recipe", {
      method: "post",
      body: JSON.stringify({
        type: "weekly",
        _id,
        owner,
      }),
    });
    const data = await res.json();

    if (data.acknowledged) {
      revalidatePage(currentPath);
    }

    setLoading(undefined);
  };

  const handleRemove = async (_id: string) => {
    if (!session?.user?.sharedWithMe?.length) {
      return handleRemoveConfirmation(_id);
    }

    return handleRemoveConfirmation(_id, session.user.sharedWithMe[0].id);
  };

  const handleAddConfirmation = async (_id: string, owner?: string) => {
    setLoading(_id);
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
      revalidatePage(currentPath);
    }

    setLoading(undefined);
  };

  const handleAdd = (_id: string) => {
    if (!session?.user?.sharedWithMe?.length) {
      return handleAddConfirmation(_id);
    }

    return handleAddConfirmation(_id, session.user.sharedWithMe[0].id);
  };

  const getOption = (recipe: RecipeListItem) => {
    if (weeklyRecipes || recipe.isInWeekly) {
      return (
        <Tooltip>
          <Tooltip.Element label="Usuń z przepisów tygodnia" />
          <Tooltip.Trigger>
            <Button
              iconOnly
              aria-label="remove recipe"
              icon={<Icon color="icon-gray-50" type="trash" />}
              variant={loading === recipe.originalId ? "solid" : "transparent"}
              loading={recipe.originalId === loading}
              onClick={() => handleRemove(recipe.originalId)}
            />
          </Tooltip.Trigger>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <Tooltip.Element label="Dodaj do przepisów tygodnia" />
        <Tooltip.Trigger>
          <Button
            iconOnly
            aria-label="add recipe"
            icon={<Icon color="icon-gray-50" type="add_more" />}
            variant={loading === recipe.originalId ? "solid" : "transparent"}
            loading={recipe.originalId === loading}
            onClick={() => handleAdd(recipe.originalId)}
          />
        </Tooltip.Trigger>
      </Tooltip>
    );
  };

  return (
    <>
      {page ? (
        <Flex className={css.header} marginTop="m" marginBottom="m" fullWidth>
          <Box padding={["s"]}>
            <Flex justifyContent="space-evenly" fullWidth alignItems="center">
              {page > 1 ? (
                <Link href={`./${page - 1}`}>
                  <Button variant="outline-inverted">
                    <Icon size={24} color="icon-white" type="arrow_left" />
                  </Button>
                </Link>
              ) : (
                <Button disabled variant="outline-inverted">
                  <Icon size={24} color="icon-white" type="arrow_left" />
                </Button>
              )}
              <TextBit size={["small"]} color="text-white">
                Strona {page}
              </TextBit>
              <Link href={`./${page + 1}`}>
                <Button variant="outline-inverted">
                  <Icon size={24} color="icon-white" type="arrow_right" />
                </Button>
              </Link>
            </Flex>
          </Box>
        </Flex>
      ) : null}

      <Flex
        wrap
        alignItems="center"
        justifyContent="space-evenly"
        className={css.list}
      >
        {recipes.map((recipe) => {
          return (
            <Flex
              className={css.box}
              direction="column"
              marginRight="s"
              marginLeft="s"
              marginBottom="m"
              key={recipe._id}
            >
              <Link
                href={`/recipe/${
                  weeklyRecipes ? recipe.originalId : recipe._id
                }?referer=${currentPath}`}
              >
                <Image
                  src={recipe.photoPath}
                  alt={recipe.name}
                  width={275}
                  height={182}
                  priority
                  className={css.image}
                />
                <Flex marginTop="s" marginBottom="s">
                  <Headline color="text-white" size="small">
                    {recipe.name.length > MAX_NAME_LENGTH
                      ? `${recipe.name.slice(0, MAX_NAME_LENGTH - 3)}...`
                      : recipe.name}
                  </Headline>
                </Flex>
              </Link>
              <SeparatorHorizontal color="gray-50" />
              <Flex marginTop="s" justifyContent="space-between">
                <CostLabel recipe={recipe} />
                {getOption(recipe)}
              </Flex>
            </Flex>
          );
        })}
        {weeklyRecipes && <RecipeRollOne />}
      </Flex>
    </>
  );
};
