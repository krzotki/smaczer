import {
  Flex,
  Headline,
  Link,
  SeparatorHorizontal,
  Spinner,
} from "brainly-style-guide";
import css from "./RecipesList.module.scss";
import Image from "next/image";
import { revalidatePage } from "@/utils/revalidatePage";
import { usePathname, useSearchParams } from "next/navigation";

import React from "react";

export const RecipeRollOne = () => {
  const [loading, setLoading] = React.useState(false);
  const handleClick = React.useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const res = await fetch("/api/roll-single-recipe", { method: "post" });
    const data = await res.json();

    setLoading(false);
    if (data.acknowledged) {
      revalidatePage("/");
    }
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Flex
      className={`${css.box} ${css.roll}`}
      direction="column"
      marginRight="s"
      marginLeft="s"
      marginBottom="m"
      onClick={handleClick}
    >
      <Image
        src="/roll_recipe.png"
        alt="roll recipe"
        width={275}
        height={182}
        priority
        className={css.image}
      />
      <Flex marginTop="l" marginBottom="s" justifyContent="center">
        <Headline color="text-green-40" size="small" align="to-center">
          + Wylosuj dodatkowy obiad
        </Headline>
      </Flex>
    </Flex>
  );
};
