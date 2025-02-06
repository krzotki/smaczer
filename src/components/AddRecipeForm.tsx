"use client";

import { Box, Button, Flex, Input } from "brainly-style-guide";
import React from "react";
import { useRouter } from "next/navigation";
import { revalidatePage } from "@/utils/revalidatePage";
import { useSession } from "next-auth/react";

export const AddRecipeForm = () => {
  const [url, setUrl] = React.useState();

  const [error, setError] = React.useState<string>();

  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const { data: session } = useSession();

  const handleAddConfirmation = async (_id: string, owner?: string) => {
    const res = await fetch("/api/add-recipe-to-weekly", {
      method: "post",
      body: JSON.stringify({
        _id,
        owner,
      }),
    });
    const data = await res.json();

    if (data.acknowledged) {
      revalidatePage("/");
    }
  };

  const handleAdd = (_id: string) => {
    if (!session?.user?.sharedWithMe?.length) {
      return handleAddConfirmation(_id);
    }

    return handleAddConfirmation(_id, session.user.sharedWithMe[0].id);
  };

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

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.insertedId) {
        await handleAdd(data.insertedId);
        setLoading(false);
        router.push(`/recipe/${data.insertedId}`, { scroll: false });
      }
    },
    [url, router]
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
            Dodaj przepis ze Smakera
          </Button>
        </Flex>
      </Box>
    </form>
  );
};
