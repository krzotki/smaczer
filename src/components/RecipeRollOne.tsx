import { Flex, Headline, Link, SeparatorHorizontal } from "brainly-style-guide";
import css from "./RecipesList.module.scss";
import Image from "next/image";

export const RecipeRollOne = () => {
  return (
    <Flex
      className={css.box}
      direction="column"
      marginRight="s"
      marginLeft="s"
      marginBottom="m"
    >
      <Image
        src="/roll_recipe.png"
        alt="roll recipe"
        width={275}
        height={182}
        priority
        className={css.image}
      />
      <Flex marginTop="l" marginBottom="s" justifyContent='center'>
        <Headline color="text-green-40" size="small" align='to-center'>
          + Wylosuj dodatkowy obiad
        </Headline>
      </Flex>
    </Flex>
  );
};
