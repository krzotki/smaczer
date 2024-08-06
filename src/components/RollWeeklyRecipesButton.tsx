"use client";

import { revalidatePage } from "@/utils/revalidatePage";
import { Button, Flex, TextBit, Tooltip } from "brainly-style-guide";
import { useParams, useRouter } from "next/navigation";
import React from "react";

export const RollWeeklyRecipesButton = () => {
  const [loading, setLoading] = React.useState(false);
  const params = useParams();
  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/roll-recipes", {
      method: "post",
      body: JSON.stringify({ owner: params.userId }),
    });
    const data = await res.json();

    setLoading(false);
    if (data.acknowledged) {
      revalidatePage("/");
    }
  };

  return (
    <Flex
      justifyContent="center"
      direction="column"
      alignItems="center"
      margin="m"
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
        variant="outline-inverted"
        disabled={loading}
        loading={loading}
      >
        Wylosuj nowe przepisy
      </Button>
    </Flex>
  );
};
