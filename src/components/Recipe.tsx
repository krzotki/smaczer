"use client";

import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  Box,
  Button,
  Flex,
  Headline,
  Icon,
  Link,
  List,
  ListItem,
  ListItemIcon,
  Popover,
  SubjectIcon,
  Text,
  TextBit,
  Tooltip,
} from "brainly-style-guide";
import React from "react";
import css from "./Recipe.module.scss";
import { RecipeType } from "@/recipes/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CostLabel } from "./CostLabel";
import { revalidatePage } from "@/utils/revalidatePage";

export const getCostDescription = (cost: string) => {
  const lines = cost.split("\n");
  lines.pop();
  lines.pop();
  return lines.join("\n");
};

export const Recipe = ({ recipe }: { recipe: RecipeType }) => {
  const searchParams = useSearchParams();
  const currentPath = usePathname();
  const page = React.useMemo(() => {
    try {
      return Number(searchParams.get("page"));
    } catch {
      return undefined;
    }
  }, [searchParams]);

  const { back } = useRouter();

  const [loading, setLoading] = React.useState(false);

  const recalculateCost = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/recalculate-cost", {
      method: "post",
      body: JSON.stringify({
        _id: recipe._id,
      }),
    });
    const data = await res.json();

    setLoading(false);
    if (data.success) {
      revalidatePage(currentPath);
      revalidatePage('/');
    }
  }, [recipe, currentPath]);

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
            <Button variant="outline-inverted" onClick={back}>
              <Icon size={32} color="icon-white" type="arrow_left" />
            </Button>
          )}
          <Flex marginLeft="s">
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
          {recipe.ingredientsCost && (
            <Flex fullWidth marginTop="s" justifyContent="stretch">
              <Accordion className={css.accordion}>
                <AccordionItem
                  padding="xs"
                  id="accordion-item-1"
                  title={
                    <Flex
                      fullWidth
                      justifyContent="flex-start"
                      className="sg-space-x-m"
                      alignItems="center"
                    >
                      <Text>Przybliżony całkowity koszt </Text>
                      <Flex>
                        <CostLabel recipe={recipe} />
                      </Flex>
                    </Flex>
                  }
                >
                  <Flex
                    direction="column"
                    alignItems="flex-start"
                    className="sg-space-y-m"
                  >
                    <Text size="small" color="text-black">
                      {getCostDescription(recipe.ingredientsCost)}
                    </Text>
                    <Button
                      loading={loading}
                      disabled={loading}
                      onClick={recalculateCost}
                      icon={<SubjectIcon monoColor='icon-white' size="small" type="mathematics" />}
                    >
                      Oblicz ponownie
                    </Button>
                  </Flex>
                </AccordionItem>
              </Accordion>
            </Flex>
          )}
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
          <List spaced className={css.fullWidth}>
            {recipe.steps.map((step, index) => (
              <ListItem key={step.description} className={css.fullWidth}>
                <ListItemIcon>
                  <TextBit>{index + 1}</TextBit>
                </ListItemIcon>
                <Box padding="m" className={css.fullWidth}>
                  <Flex direction="column" fullWidth>
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
