"use client"

import { createContext, useContext, useState, ReactNode } from "react";
import { SearchContextType, SearchResultContextType } from "@/types/Query";
import { useSearch } from "@/hooks/search"
import { SearchPayload} from "@/types/Search"
import { IgnoreContextType } from "@/types/Query";
import { useEffect } from "react";
const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("metaclip2");
  const [queryName, setQueryName] = useState("")
  const [topK, setTopK] = useState<number>(100)

  const [dataSource, setDataSource] = useState("");
  const [numQuery, setNumQuery] = useState<number>(1)
  // Lấy localStorage khi chạy ở client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const username = localStorage.getItem("username") ?? "";
      setDataSource(username);
    }
  }, []);
  
  

  return (
    <SearchContext.Provider value={{ query, setQuery, mode, setMode, queryName, setQueryName, dataSource, setDataSource, topK, setTopK, numQuery, setNumQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return ctx;
}



const SearchResultContext = createContext<SearchResultContextType | undefined>(undefined);

export function SearchResultProvider({ children }: { children: ReactNode }) {
    const { results, searching, reranking, search, rerank } = useSearch();
    const handleSearch = (searchPayload: SearchPayload) => {
        search("simple", searchPayload);
    };
    const handleRerank = () => {
        rerank();
    };
    const [cols, setCols] = useState<number | "">("")
    return (
    <SearchResultContext.Provider value={{ results, searching, handleRerank, reranking, handleSearch, cols, setCols }}>
      {children}
    </SearchResultContext.Provider>
  );
}

export function useSearchResultContext() {
  const ctx = useContext(SearchResultContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return ctx;
}


const IgnoreContext = createContext<IgnoreContextType | undefined>(undefined);

export function IgnoreProvider({ children }: { children: ReactNode }) {
  // phân trang
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <IgnoreContext.Provider value={{currentPage, setCurrentPage }}>
      {children}
    </IgnoreContext.Provider>
  );
}

export function useIgnoreContext() {
  const ctx = useContext(IgnoreContext);
  if (!ctx) {
    throw new Error("useIgnoreContext must be used within a SearchProvider");
  }
  return ctx;
}