"use client";

import { Box, Chip, Flex, Link, TextBit } from "brainly-style-guide";
import { SearchForm } from "./SearchForm";
import css from "./Header.module.scss";
import { usePathname, useRouter } from "next/navigation";

export const Header = ({
  initialIngredients,
}: {
  initialIngredients?: string;
}) => {
  const path = usePathname();
  const { push } = useRouter();

  return (
    <Flex direction={"column"} fullWidth className={css.header}>
      <Flex
        fullWidth
        direction={["column", "row"]}
        justifyContent={["center", "flex-start"]}
        alignItems="center"
      >
        <Link href="/">
          <Box padding={["xs", "m"]}>
            <TextBit>Smaczer</TextBit>
          </Box>
        </Link>
        <SearchForm initialIngredients={initialIngredients} />
      </Flex>

      <Flex
        className="sg-space-x-m"
        fullWidth
        marginTop={["s", "none"]}
        justifyContent={["center", "flex-start"]}
        marginLeft={["none", "m"]}
      >
        <Chip
          className="sg-chip--custom-theme"
          checked={path === "/"}
          value="random"
          onClick={() => push("/")}
        >
          Przepisy tygodnia
        </Chip>
        <Chip
          className="sg-chip--custom-theme"
          checked={path.includes("/recipes")}
          value="all"
          onClick={() => push("/recipes/1")}
        >
          Wszystkie przepisy
        </Chip>
      </Flex>
    </Flex>
  );
};
