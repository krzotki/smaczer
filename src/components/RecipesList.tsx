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

export const RecipesList = ({
  recipes,
  page,
}: {
  recipes: RecipeListItem[];
  page?: number;
}) => {
  return (
    <Flex direction="column" className={css.container} alignItems="center">
      <Flex
        direction={["column", "row"]}
        alignItems="center"
        justifyContent={["center", "flex-start"]}
        fullWidth
        className={css.navigation}
      >
        <Link href="/">
          <Box padding={['xs', 'm']}>
            <TextBit>Smaczer</TextBit>
          </Box>
        </Link>
        <SearchForm />
      </Flex>
      {page ? (
        <Flex justifyContent="space-evenly" className={css.header} fullWidth>
          {page > 1 ? (
            <Link href={`./${page - 1}`}>
              <Button variant="outline-inverted">
                <Icon size={32} color="icon-white" type="arrow_left" />
              </Button>
            </Link>
          ) : (
            <Button disabled variant="outline-inverted">
              <Icon size={32} color="icon-white" type="arrow_left" />
            </Button>
          )}
          <Headline size="large" color="text-white">
            Strona {page}
          </Headline>
          <Link href={`./${page + 1}`}>
            <Button variant="outline-inverted">
              <Icon size={32} color="icon-white" type="arrow_right" />
            </Button>
          </Link>
        </Flex>
      ) : null}
      <Flex
        direction={["column", "column", "row"]}
        wrap
        marginTop="m"
        alignItems="center"
        justifyContent="space-between"
        className={css.list}
      >
        {recipes.map((recipe) => {
          return (
            <Flex
              marginBottom="l"
              marginLeft={["none", "s"]}
              marginRight={["none", "s"]}
              className={css.box}
              key={recipe._id}
            >
              <Link
                href={`/recipe/${recipe._id}?page=${page}`}
                className={css.link}
              >
                <Box border borderColor="green-30">
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
                    >
                      <Headline color="text-white" size="small">
                        {recipe.name.length > MAX_NAME_LENGTH
                          ? `${recipe.name.slice(0, MAX_NAME_LENGTH - 3)}...`
                          : recipe.name}
                      </Headline>
                    </Flex>
                  </Flex>
                </Box>
              </Link>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
