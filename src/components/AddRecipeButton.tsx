"use client";

import { Button, Flex, Icon } from "brainly-style-guide";
import css from "./AddRecipeButton.module.scss";
import Link from "next/link";
export const AddRecipeButton = () => {
  return (
    <Flex className={css.button}>
      <Link href="/recipe/add/">
        <Button variant="solid-inverted" type="button">
          <Icon type="plus" size={32} color="icon-black" />
          Dodaj przepis
        </Button>
      </Link>
    </Flex>
  );
};
