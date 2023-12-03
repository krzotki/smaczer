"use client";

import { Button, Flex, Link, TextBit, Tooltip } from "brainly-style-guide";
import { useRouter } from "next/navigation";
import React from "react";

export const ExportShoppingListButton = () => {
  const [loading, setLoading] = React.useState(false);
  const [exported, setExported] = React.useState(false);
  const handleClick = React.useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/export-to-sheets?update=1");
    const data = await res.json();

    setLoading(false);
    setExported(true);
  }, []);

  return (
    <Flex
      justifyContent="center"
      margin="m"
      direction="column"
      alignItems="center"
    >
      {loading && (
        <Flex marginBottom="m">
          <TextBit size="small" color="text-white">
            Pobieram i sumuję składniki...
          </TextBit>
        </Flex>
      )}
      {!exported ? (
        <Button
          onClick={handleClick}
          variant="solid-inverted"
          disabled={loading}
          loading={loading}
        >
          Stwórz listę zakupów
        </Button>
      ) : (
        <Flex marginBottom="m">
          <TextBit size="small" color="text-green-40">
            Stworzono listę!
          </TextBit>
        </Flex>
      )}
      <Flex marginTop="m">
        <Link
          target="_blank"
          color="text-green-40"
          href="https://docs.google.com/spreadsheets/d/1-JiwaI8l943B6Wbqh4yCVRLPMqh2wwOc38hr2t1EG-I/edit#gid=0"
        >
          Lista zakupów
        </Link>
      </Flex>
    </Flex>
  );
};
