"use client";

import {
  Box,
  Chip,
  Flex,
  Link,
  TextBit,
  Popover,
  Button,
  Text
} from "brainly-style-guide";
import { SearchForm } from "./SearchForm";
import css from "./Header.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
export const Header = ({
  initialIngredients,
}: {
  initialIngredients?: string;
}) => {
  const path = usePathname();
  const { push } = useRouter();

  const { data: session } = useSession();
  const user = session?.user;
  const userMenu = user && (
    <Popover>
      <Popover.Trigger>
        <Image
          src={user?.image || ""}
          alt="user avatar"
          width={32}
          height={32}
        />
      </Popover.Trigger>
      <Popover.Element className={css.popover}>
        <Flex direction="column" gap='s'>
          <Text color='text-black'>
            Zalogowano jako: <strong>{user?.name}</strong>
          </Text>
          <Button variant="outline" onClick={() => signOut()}>
            Wyloguj
          </Button>
        </Flex>
      </Popover.Element>
    </Popover>
  );
  return (
    <Flex direction={"column"} fullWidth className={css.header}>
      <Flex
        fullWidth
        direction={["column", "row"]}
        justifyContent={["center", "flex-start"]}
        alignItems="center"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          fullWidth={[true, false]}
        >
          <Link href="/">
            <Box padding={["xs", "m"]}>
              <TextBit>Smaczer</TextBit>
            </Box>
          </Link>
          <Flex
            marginTop={["xs", "none"]}
            marginRight={["xs", "none"]}
            className="sg-hide-for-medium-up"
          >
            {userMenu}
          </Flex>
        </Flex>

        <SearchForm initialIngredients={initialIngredients} />
        <div className="sg-hide-for-small-only">{userMenu}</div>
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
