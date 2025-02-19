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
import { useSession } from "next-auth/react";

export const getCostDescription = (cost: string) => {
  const lines = cost.split("\n");
  lines.pop();
  lines.pop();
  return lines.join("\n");
};

export const Recipe = ({ recipe }: { recipe: RecipeType }) => {
  const searchParams = useSearchParams();
  const currentPath = usePathname();

  const referer = React.useMemo(() => {
    return searchParams.get("referer") || undefined;
  }, [searchParams]);

  const { back, push } = useRouter();

  const handleLinkClick = React.useCallback(
    (evt) => {
      evt.preventDefault();
      back();
    },
    [back]
  );

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
      revalidatePage("/");
    }
  }, [recipe, currentPath]);

  const removeRecipe = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/remove-recipe", {
      method: "post",
      body: JSON.stringify({
        _id: recipe._id,
      }),
    });
    const data = await res.json();

    setLoading(false);
    if (data.acknowledged) {
      push("/");
    }
  }, [recipe, currentPath]);

  const { data: session } = useSession();
  const user = session?.user;

  const isAuthor = user?.id === recipe.user.id;

  return (
    <Flex alignItems="center" direction="column" className={css.container}>
      <Box padding={["s", "m"]}>
        <Flex alignItems="center">
          {referer ? (
            <Link onClick={handleLinkClick} href={referer}>
              <Button variant="outline-inverted">
                <Icon size={32} color="icon-white" type="arrow_left" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline-inverted" onClick={() => push("/")}>
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
                    {isAuthor && (
                      <Flex gap="m">
                        <Button
                          loading={loading}
                          disabled={loading}
                          onClick={recalculateCost}
                          icon={
                            <SubjectIcon
                              monoColor="icon-white"
                              size="small"
                              type="mathematics"
                            />
                          }
                        >
                          Oblicz ponownie
                        </Button>
                        <Button
                          loading={loading}
                          disabled={loading}
                          onClick={() => push(`/recipe/${recipe._id}/edit`)}
                          icon={
                            <Icon color="icon-white" size={16} type="pencil" />
                          }
                        >
                          Edytuj
                        </Button>
                        <Button
                          loading={loading}
                          disabled={loading}
                          onClick={removeRecipe}
                          icon={
                            <Icon color="icon-white" size={16} type="trash" />
                          }
                        >
                          Usuń przepis
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                </AccordionItem>
              </Accordion>
            </Flex>
          )}
          <Flex marginTop="s">
            <div>
              Autor: <strong>{recipe.user.name}</strong>
            </div>
          </Flex>
        </Flex>
      </Box>
      <Box border noBorderRadius className={css.steps} padding={["s", "m"]}>
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
                <Box padding={["s", "m"]} className={css.fullWidth}>
                  <Flex direction="column" fullWidth>
                    <Text color="text-white" whiteSpace="pre-wrap">
                      <TextBit
                        style={{ padding: "10px 10px 10px 0px" }}
                        as="span"
                      >
                        {index + 1}.
                      </TextBit>

                      {step.description
                        .split(".")
                        .map((sentence) => sentence.trim())
                        .join(".\n\n")}
                    </Text>
                    {step.photoPath ? (
                      <Image
                        src={step.photoPath}
                        width={302}
                        height={200}
                        alt={step.description}
                        className={css.stepImage}
                        style={{ marginTop: "10px" }}
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
