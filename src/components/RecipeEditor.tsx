import loading from "@/app/search/[ingredients]/loading";
import { RecipeType } from "@/recipes/types";
import {
  Flex,
  Input,
  Spinner,
  Icon,
  Textarea,
  Box,
  TextBit,
  Button,
  SeparatorHorizontal,
  Text,
} from "brainly-style-guide";
import React from "react";
import Image from "next/image";

export type NewRecipeType = Pick<RecipeType, "id" | "name" | "photoPath"> & {
  thumbnails: {
    xl: string;
  };
  steps: Array<{
    description: string;
    photoPath: string;
  }>;
  ingredients: Array<{
    items: Array<{
      name: string;
      id: string;
    }>;
  }>;
};

export const RecipeEditor = ({
  recipe,
  setRecipe,
}: {
  recipe: NewRecipeType;
  setRecipe: (value: React.SetStateAction<NewRecipeType>) => void;
}) => {
  const uploadFile = async (file: File, stepIndex?: number) => {
    const formData = new FormData();
    formData.append("file", file);

    setRecipe((prev) => {
      if (stepIndex !== undefined) {
        return {
          ...prev,
          steps: prev.steps.map((step, index) =>
            index === stepIndex ? { ...step, photoPath: "loading" } : step
          ),
        };
      } else {
        return {
          ...prev,
          thumbnails: {
            xl: "loading",
          },
        };
      }
    });

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setRecipe((prev) => {
      if (stepIndex !== undefined) {
        return {
          ...prev,
          steps: prev.steps.map((step, index) =>
            index === stepIndex ? { ...step, photoPath: data.url } : step
          ),
        };
      } else {
        return {
          ...prev,
          photoPath: data.url,
          thumbnails: {
            xl: data.url,
          },
        };
      }
    });
  };

  return (
    <Flex direction="column" gap="m" alignItems="center">
      <Flex gap="m">
        <Input
          type="file"
          onChange={(e: any) => {
            console.log(e.target);
            uploadFile(e.target.files ? e.target.files[0] : null);
          }}
        />
      </Flex>

      {recipe.thumbnails.xl ? (
        recipe.thumbnails.xl === "loading" ? (
          <Spinner />
        ) : (
          <Image
            width={1218 / 3}
            height={846 / 3}
            src={recipe.thumbnails.xl}
            alt={recipe.name}
          />
        )
      ) : (
        <Text color="text-gray-40">
          <Flex gap="s">
            <Icon type="arrow_up" color="icon-gray-40" /> Wybierz główne zdjęcie
            dania
          </Flex>
        </Text>
      )}

      <Flex justifyContent="flex-start" alignItems="center" gap="m" fullWidth>
        <Text color="text-gray-40">Nazwa dania</Text>
        <Input
          id="recipe-name"
          value={recipe.name}
          onChange={(e: any) =>
            setRecipe((prev) => ({ ...prev, name: e.target.value as string }))
          }
        />
      </Flex>

      <Flex gap="m" justifyContent="flex-start" fullWidth>
        <Text color="text-gray-40">Składniki</Text>
        <Textarea
          style={{ height: "400px", width: "400px" }}
          onChange={(evt: any) => {
            const ingredients = evt.target.value
              .split("\n")

              .map((i: string) => ({
                name: i,
                id: `${i}_${Math.random().toString(36).substring(2, 9)}`,
              }));

            setRecipe((prev) => ({
              ...prev,
              ingredients: [{ items: ingredients }],
            }));
          }}
          value={recipe.ingredients
            .map((i) => i.items.map((item) => item.name))
            .flat()
            .join("\n")}
        />
      </Flex>

      <Flex gap="m" justifyContent="flex-start" fullWidth>
        <Text color="text-gray-40">Kroki</Text>

        <Flex direction={"column"} gap="m">
          {recipe.steps.map((step, index) => (
            <Box
              key={index}
              style={{
                border: "solid 1px gray",
              }}
            >
              <Flex direction="column" gap="s">
                <TextBit color="text-green-40" size="small">
                  Krok {index + 1}
                </TextBit>
                <Textarea
                  value={step.description}
                  onChange={(e: any) =>
                    setRecipe((prev) => {
                      const newSteps = [...prev.steps];
                      newSteps[index].description = e.target.value;
                      return { ...prev, steps: newSteps };
                    })
                  }
                />
                <Input
                  type="file"
                  onChange={(e: any) => {
                    uploadFile(
                      e.target.files ? e.target.files[0] : null,
                      index
                    );
                  }}
                />
                {step.photoPath ? (
                  step.photoPath === "loading" ? (
                    <Spinner />
                  ) : (
                    <Image
                      width={1218 / 3}
                      height={846 / 3}
                      src={step.photoPath}
                      alt={`Step ${index + 1}`}
                    />
                  )
                ) : (
                  <Text color="text-gray-40">
                    <Flex gap="s">
                      <Icon type="arrow_up" color="icon-gray-40" /> Wybierz
                      zdjęcie kroku
                    </Flex>
                  </Text>
                )}
              </Flex>
            </Box>
          ))}

          <Button
            onClick={() => {
              setRecipe((prev) => ({
                ...prev,
                steps: [
                  ...prev.steps,
                  {
                    description: "Krok " + (prev.steps.length + 1),
                    photoPath: "",
                  },
                ],
              }));
            }}
            icon={<Icon type="plus" />}
            variant="outline-inverted"
          >
            Dodaj krok
          </Button>
        </Flex>
      </Flex>

      <SeparatorHorizontal />
    </Flex>
  );
};
