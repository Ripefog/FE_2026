"use client"


import { createContext, useContext, useState, ReactNode } from "react";
import { IgnoreImageContextType } from "@/types/Ignore";

const IgnoreImageContext = createContext< IgnoreImageContextType| undefined>(undefined);

export function IgnoreImageProvider({ children }: { children: ReactNode }) {
    // Map<queryName, Map<keyframe_id, username>>
    const [showList, setShowList] = useState<boolean[]>([]);
    const [ignoredMap, setIgnoredMap] = useState<Map<string, Map<string, string>>>(new Map());
    const [ignoredUsernames, setIgnoredUsernames] = useState<(string | null)[]>([]);

    return (
        <IgnoreImageContext.Provider value={{showList, setShowList, ignoredMap, setIgnoredMap, ignoredUsernames, setIgnoredUsernames}}>
        {children}
        </IgnoreImageContext.Provider>
    );
}

export function useIgnoreImageContext() {
  const ctx = useContext(IgnoreImageContext);
  if (!ctx) {
    throw new Error("useIgnoreImageContext must be used within a IgnoreImageProvider");
  }
  return ctx;
}