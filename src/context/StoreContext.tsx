"use client";

import React, { createContext, useContext } from "react";
import { useWfaStore } from "@/lib/store";

type StoreType = ReturnType<typeof useWfaStore>;

const StoreContext = createContext<StoreType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useWfaStore();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
