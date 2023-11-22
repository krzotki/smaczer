"use client";

import { Button, Flex } from "brainly-style-guide";
import { useRouter } from "next/navigation";
import React from "react";

export const RollWeeklyRecipesButton = () => {
  const { refresh } = useRouter();
  const handleClick = React.useCallback(async () => {
    const res = await fetch("/api/roll-recipes");
    const data = await res.json();
    console.log({data})
    if (data.acknowledged) {
      refresh();
    }
  }, [refresh]);

  return (
    <Flex fullWidth justifyContent="center" marginTop="m">
      <Button onClick={handleClick} variant="solid-inverted">
        Wylosuj nowe przepisy
      </Button>
    </Flex>
  );
};
