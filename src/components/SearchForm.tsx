"use client";

import { Box, Button, Flex, Input } from "brainly-style-guide";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import css from "./SearchForm.module.scss";

export const SearchForm = () => {
  const searchParams = useSearchParams();
  const [ingredients, setIngredients] = React.useState(
    searchParams.get("ingredients") || ""
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
      <Box>
        <Flex direction="row" alignItems="center" justifyContent="center">
          <Flex marginRight="m">
            <Input
              placeholder="kurczak fasola ser"
              onChange={handleInputChange}
              errorMessage={error}
              invalid={!!error}
            />
          </Flex>
          <Button type="submit" variant="outline-inverted">
            Szukaj
          </Button>
        </Flex>
      </Box>
    </form>
  );
};
