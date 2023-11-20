"use client";

import { Box, Button, Flex, Input } from "brainly-style-guide";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import css from "./SearchForm.module.scss";

export const SearchForm = ({
  initialIngredients,
}: {
  initialIngredients?: string;
}) => {
  console.log({initialIngredients})
  const [ingredients, setIngredients] = React.useState(
    initialIngredients || ""
  );

  const [error, setError] = React.useState<string>();
  const router = useRouter();

  const search = React.useCallback(
    async (evt) => {
      evt.preventDefault();

      if (ingredients.length) {
        router.push(`/search/${ingredients}`, { scroll: false });
      }
    },
    [ingredients]
  );

  const handleInputChange = React.useCallback((evt) => {
    setError(undefined);
    setIngredients(evt.target.value);
  }, []);

  return (
    <form onSubmit={search} className={css.form}>
      <Box padding={["xs", "m"]}>
        <Flex
          direction={["column", "row", "row"]}
          alignItems="center"
          justifyContent="flex-start"
          marginLeft={["none", "l"]}
        >
          <Flex marginRight={["none", "m", "m"]}>
            <Input
              placeholder="kurczak fasola ser"
              onChange={handleInputChange}
              errorMessage={error}
              invalid={!!error}
              value={ingredients}
            />
          </Flex>
          <Flex marginTop={["s", "none"]}>
            <Button type="submit" variant="outline-inverted">
              Szukaj
            </Button>
          </Flex>
        </Flex>
      </Box>
    </form>
  );
};
