"use client";

import { Box, Button, Flex, Input } from "brainly-style-guide";
import React from "react";
import { useRouter } from "next/navigation";

export const AddRecipeForm = () => {
  const [url, setUrl] = React.useState();

  const [error, setError] = React.useState<string>();
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);

  const sendRecipe = React.useCallback(
    async (evt) => {
      evt.preventDefault();
      setLoading(true);
      const response = await fetch("/api/add-recipe-from-url", {
        method: "post",
        body: JSON.stringify({
          url,
        }),
      });

      setLoading(false);

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.insertedId) {
        router.push(`/recipe/${data.insertedId}`, { scroll: false });
      }
    },
    [url]
  );

  const handleInputChange = React.useCallback((evt) => {
    setError(undefined);
    setUrl(evt.target.value);
  }, []);

  return (
    <form onSubmit={sendRecipe}>
      <Box>
        <Flex direction="column" alignItems="center">
          <Flex marginBottom="m">
            <Input
              placeholder="https://smaker.pl/przepisy-przekaski/przepis-domowe-nuggetsy,1988617,walek.html"
              onChange={handleInputChange}
              errorMessage={error}
              invalid={!!error}
              disabled={loading}
            />
          </Flex>
          <Button
            type="submit"
            variant="outline-inverted"
            disabled={loading}
            loading={loading}
          >
            Add recipe
          </Button>
        </Flex>
      </Box>
    </form>
  );
};
