"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";

export default function Providers({ children }: PropsWithChildren) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
