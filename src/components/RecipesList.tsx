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
} from "brainly-style-guide";
import Link from "next/link";
import React from "react";
import { RecipeListItem } from "@/recipes/getRecipes";
import css from "./RecipesList.module.scss";
import { SearchForm } from "./SearchForm";

const MAX_NAME_LENGTH = 30;

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

export const RecipesList = ({
  recipes,
  page,
}: {
  recipes: RecipeListItem[];
  page?: number;
}) => {
  console.log({recipes})
  return (
    <>
      {page ? (
        <Flex
          justifyContent="space-evenly"
          fullWidth
          alignItems="center"
          marginTop="m"
          className={css.header}
          marginBottom="m"
        >
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
      ) : null}
      <Flex
        direction={["column", "column", "row"]}
        wrap
        alignItems="center"
        justifyContent="space-between"
        className={css.list}
      >
        {recipes.map((recipe) => {
          const cost = (recipe.ingredientsCost || "").split("TOTAL_COST=")[1];
          const color = cost ? getCostColor(Number(cost)) : "gray-40";

          return (
            <Flex
              marginBottom="l"
              marginLeft={["none", "s"]}
              marginRight={["none", "s"]}
              className={css.box}
              key={recipe._id}
            >
              <Link
                href={`/recipe/${recipe._id}` + (page ? `?page=${page}` : "")}
                className={css.link}
              >
                <Box shadow className={css.boxBackground}>
                  <Flex
                    direction={["column", "row", "row"]}
                    alignItems="center"
                    fullHeight
                    fullWidth
                  >
                    <Image
                      src={recipe.photoPath}
                      alt={recipe.name}
                      width={250}
                      height={165}
                      priority
                      className={css.image}
                    />

                    <Flex
                      marginLeft={["none", "m", "m"]}
                      marginTop={["s", "none"]}
                      direction={["row", "column"]}
                      fullWidth
                      fullHeight
                      justifyContent="space-between"
                    >
                      <Flex marginTop='s' fullWidth>
                        <Headline color="text-white" size="small">
                          {recipe.name.length > MAX_NAME_LENGTH
                            ? `${recipe.name.slice(0, MAX_NAME_LENGTH - 3)}...`
                            : recipe.name}
                        </Headline>
                      </Flex>
                      <Flex marginBottom="s" fullWidth>
                        <Box padding="xs" color={color}>
                          <Text weight='bold' color="text-black" align="to-center">
                            {cost ? transformCost(cost) : "???"}
                          </Text>
                        </Box>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              </Link>
            </Flex>
          );
        })}
      </Flex>
    </>
  );
};
