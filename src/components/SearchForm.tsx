"use client";

import { Box, Button, Flex, Icon, Input } from "brainly-style-guide";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import css from "./SearchForm.module.scss";

export const SearchForm = ({
  initialIngredients,
}: {
  initialIngredients?: string;
}) => {
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
    [ingredients, router]
  );

  const handleInputChange = React.useCallback((evt) => {
    setError(undefined);
    setIngredients(evt.target.value);
  }, []);

  return (
    <form onSubmit={search} className={css.form}>
      <Box padding={["xs", "m"]}>
        <Flex
          direction="row"
          alignItems="center"
          justifyContent={["space-between", "flex-start"]}
          marginLeft={["none", "l"]}
        >
          <Flex marginRight={["none", "m", "m"]} fullWidth={[true, false]}>
            <Input
              placeholder="kurczak fasola ser"
              onChange={handleInputChange}
              errorMessage={error}
              invalid={!!error}
              value={ingredients}
              className={css.input}
              fullWidth
            />
          </Flex>
          <Flex>
            <Button type="submit" variant="outline-inverted">
              <Icon type="search" size={24} />
            </Button>
          </Flex>
        </Flex>
      </Box>
    </form>
  );
};
