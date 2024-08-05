"use client";

import { Button, Icon } from "brainly-style-guide";
import { useRouter } from "next/navigation";

export const GoToSharedButton = ({ link }: { link: string }) => {
  "use client";
  const { push } = useRouter();
  return (
    <Button variant="solid-inverted" onClick={() => push(link)} icon={<Icon color='icon-black' type="arrow_right" />}>
      Przejdź do przepisów
    </Button>
  );
};
