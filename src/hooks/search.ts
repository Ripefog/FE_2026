"use client"

import { useState } from "react";
import { simpleSearch, temporalSearch } from "@/api/search";
import { SearchPayload } from "@/types/Search";

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const search = async (type: string, searchPayload: SearchPayload) => {
    // console.log(`search payload ${type}`, searchPayload)
    setSearching(true);
    try {
      let data;
      if (type === "simple") {
        data = await simpleSearch(searchPayload);
      } else {
        data = await temporalSearch(searchPayload);
      }
    //   console.log("data", data)
      if (process.env.NEXT_PUBLIC_MODE === "test") {
        setResults(data || [])
        return
      }
      setResults(data?.results || []);
    
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  return { results, searching, search };
};
