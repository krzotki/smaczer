"use client";

import { Button, Flex, TextBit, Tooltip } from "brainly-style-guide";
import { useRouter } from "next/navigation";
import React from "react";

export const RollWeeklyRecipesButton = () => {
  const { refresh } = useRouter();
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/roll-recipes", { method: "post" });
    const data = await res.json();
    console.log({ data });
    setLoading(false);
    if (data.acknowledged) {
      refresh();
    }
  }, [refresh]);

  return (
    <Flex
      fullWidth
      justifyContent="center"
      marginBottom="l"
      direction="column"
      alignItems="center"
    >
      {loading && (
        <Flex marginBottom="m">
          <TextBit size="small" color="text-white">
            Szukam przepisów oraz obliczam koszty składników...
          </TextBit>
        </Flex>
      )}
      <Button
        onClick={handleClick}
        variant="solid-inverted"
        disabled={loading}
        loading={loading}
      >
        Wylosuj nowe przepisy
      </Button>
    </Flex>
  );
};
