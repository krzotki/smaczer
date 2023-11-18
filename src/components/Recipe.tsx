"use client";

import Image from "next/image";
import {
  Box,
  Flex,
  Headline,
  Icon,
  List,
  ListItem,
  ListItemIcon,
  Text,
  TextBit,
} from "brainly-style-guide";
import React from "react";
import css from "./Recipes.module.scss";
import { Recipe } from "@/recipes/types";

export const Recipes = ({ recipe }: { recipe: Recipe }) => {
  console.log({ recipe });
  return (
    <Flex alignItems="center" direction="column" className={css.container}>
      <Box padding="m">
        <Headline align="to-center" size="xlarge" color="text-white">
          {recipe.name}
        </Headline>
      </Box>
      <Image
        width={1218}
        height={846}
        src={recipe.thumbnails.xl}
        alt={recipe.name}
        className={css.image}
      />
      <Box noBorderRadius className={css.ingredients}>
        <Flex
          direction="column"
          fullWidth
          alignItems="flex-start"
          marginTop="m"
          marginBottom="m"
        >
          <Flex marginBottom="s">
            <Headline color="text-white" size="large">
              Składniki:
            </Headline>
          </Flex>
          <List spaced>
            {recipe.ingredients.map((ingredient) =>
              ingredient.items.map((item) => (
                <ListItem key={item.id}>
                  <ListItemIcon>
                    <Icon
                      aria-hidden
                      color="icon-white"
                      size={16}
                      type="chevron_right"
                    />
                  </ListItemIcon>
                  <Text color="text-white">{item.name}</Text>
                </ListItem>
              ))
            )}
          </List>
        </Flex>
      </Box>
      <Box border noBorderRadius className={css.steps}>
        <Flex
          direction="column"
          fullWidth
          alignItems="flex-start"
          marginTop="m"
          marginBottom="m"
        >
          <Flex marginBottom="s">
            <Headline color="text-white" size="large">
              Przygotowanie:
            </Headline>
          </Flex>
          <List spaced>
            {recipe.steps.map((step, index) => (
              <ListItem key={step.description}>
                <ListItemIcon>
                  <TextBit>{index + 1}</TextBit>
                </ListItemIcon>
                <Box padding="m">
                  <Flex direction="column">
                    <Text color="text-white">{step.description}</Text>
                    {step.photoPath ? (
                      <Image
                        src={step.photoPath}
                        width={302}
                        height={200}
                        alt={step.description}
                      ></Image>
                    ) : null}
                  </Flex>
                </Box>
              </ListItem>
            ))}
          </List>
        </Flex>
      </Box>
    </Flex>
  );
};
