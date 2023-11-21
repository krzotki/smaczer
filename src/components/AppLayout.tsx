'use client'

import { Flex } from "brainly-style-guide";
import css from "./AppLayout.module.scss";
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
