"use client";

import { Flex } from "brainly-style-guide";
import css from "./AppLayout.module.scss";
import { signIn } from "next-auth/react";
import { Session } from "next-auth";
export const AppLayout = ({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) => {
  return (
    <Flex direction="column" className={css.container} alignItems="center">
      {header}
      {children}
    </Flex>
  );
};
