"use client"

import { useState, useRef } from "react";
import { simpleSearch, temporalSearch, rerankSearch } from "@/api/search";
import { SearchPayload } from "@/types/Search";

export const useSearch = () => {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [reranking, setReranking] = useState(false);

  // Lưu payload lần search gần nhất để rerank dùng lại đúng query/mode
  const lastPayloadRef = useRef<SearchPayload | null>(null);

  const search = async (type: string, searchPayload: SearchPayload) => {
    // console.log(`search payload ${type}`, searchPayload)
    lastPayloadRef.current = searchPayload;
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

  // Rerank danh sách kết quả hiện tại theo query vừa tìm
  const rerank = async () => {
    const payload = lastPayloadRef.current;
    if (!payload || results.length === 0) return;

    setReranking(true);
    try {
      const frames = results.map((r: any) => ({
        keyframe_id: r.keyframe_id as string,
        score: r.score ?? null,
      }));
      const data = await rerankSearch(payload, frames);
      // GroundingResult: {keyframe_id, grounding_score, final_score, ...} — map final_score về score của FE
      const ranked: any[] = (data?.results || []).map((r: any) => ({
        ...r,
        score: r.final_score ?? r.retrieval_score ?? 0,
      }));
      ranked.sort((a, b) => b.score - a.score);
      setResults(ranked);
    } catch (error) {
      console.error("Rerank error:", error);
      alert("Rerank thất bại — xem console để biết chi tiết");
    } finally {
      setReranking(false);
    }
  };

  return { results, searching, reranking, search, rerank };
};
