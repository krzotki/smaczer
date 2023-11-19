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
} from "brainly-style-guide";
import Link from "next/link";
import React from "react";
import { RecipeListItem } from "@/recipes/getRecipes";
import css from "./RecipesList.module.scss";

export const RecipesList = ({
  recipes,
  page,
}: {
  recipes: RecipeListItem[];
  page: number;
}) => {
  return (
    <Flex direction="column" className={css.container} alignItems='center'>
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
      <Flex
        direction="row"
        wrap
        marginTop="m"
        marginLeft="m"
        marginRight="m"
        justifyContent="space-evenly"
        className={css.list}
      >
        {recipes.map((recipe) => {
          return (
            <Link key={recipe._id} href={`/recipe/${recipe._id}?page=${page}`}>
              <Flex
                marginBottom="l"
                marginLeft="s"
                marginRight="s"
                className={css.box}
              >
                <Box border borderColor="green-30">
                  <Flex
                    direction="row"
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

                    <Flex marginLeft="m">
                      <Headline color="text-white" size="small">
                        {recipe.name}
                      </Headline>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            </Link>
          );
        })}
      </Flex>
    </Flex>
  );
};
