"use client";

import Image from "next/image";
import {
  Box,
  Button,
  Flex,
  Headline,
  Icon,
  Link,
  List,
  ListItem,
  ListItemIcon,
  Text,
  TextBit,
} from "brainly-style-guide";
import React from "react";
import css from "./Recipe.module.scss";
import { RecipeType } from "@/recipes/types";
import { useSearchParams } from "next/navigation";
export const Recipe = ({ recipe }: { recipe: RecipeType }) => {
  const searchParams = useSearchParams();

  const page = React.useMemo(() => {
    try {
      return Number(searchParams.get("page"));
    } catch {
      return undefined;
    }
  }, [searchParams]);

  return (
    <Flex alignItems="center" direction="column" className={css.container}>
      <Box padding="m">
        <Flex alignItems="center">
          {page ? (
            <Link href={`/recipes/${page}`}>
              <Button variant="outline-inverted">
                <Icon size={32} color="icon-white" type="arrow_left" />
              </Button>
            </Link>
          ) : (
            <Link href={`/recipes/1`}>
              <Button variant="outline-inverted">
                <Icon size={32} color="icon-white" type="arrow_left" />
              </Button>
            </Link>
          )}
          <Flex marginLeft='s'>
            <Headline align="to-center" size="xlarge" color="text-white">
              {recipe.name}
            </Headline>
          </Flex>
        </Flex>
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
                        className={css.stepImage}
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
