"use client";

import { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";

import Sidebar from "@/components/utils/Siderbar";
import TrakeSearchBar from "@/components/trake/TrakeSearchBar";
import TrakeSequences from "@/components/trake/TrakeSequences";
import ImageGallery from "@/components/imageGalllery/ImageGallery";

import { trakeSearch } from "@/api/search";
import { TrakeSearchPayload, TrakeSearchResponse } from "@/types/Trake";

import { SearchProvider, IgnoreProvider } from "@/contexts/searchContext";
import { IgnoreImageProvider } from "@/contexts/ignoreContext";

export default function TrakePage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [response, setResponse] = useState<TrakeSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // tab 0 = chuỗi sự kiện; tab i (i≥1) = kết quả riêng của sự kiện i
  const [tab, setTab] = useState(0);

  const handleSearch = async (payload: TrakeSearchPayload) => {
    setSearching(true);
    setError(null);
    try {
      const data = await trakeSearch(payload);
      setResponse(data);
      setTab(0); // về tab chuỗi sau mỗi lần search
    } catch (e: any) {
      console.error("TRAKE search error:", e);
      setError(
        e?.response?.status === 422
          ? "BE từ chối payload (422) — kiểm tra lại tham số (Top K ≤ 200, số sequences ≤ 50…)"
          : "Tìm kiếm TRAKE thất bại — xem console để biết chi tiết"
      );
      setResponse(null);
    } finally {
      setSearching(false);
    }
  };

  const nEvents = response?.sequential_queries?.length ?? 0;

  return (
    <SearchProvider>
      {/* ImageGallery cần IgnoreProvider (phân trang) + IgnoreImageProvider (hide/show ảnh) */}
      <IgnoreProvider>
        <IgnoreImageProvider>
          <Sidebar open={drawerOpen} setOpen={setDrawerOpen} />

          <Box className="w-screen h-screen flex flex-col p-2 gap-2">
            <TrakeSearchBar searching={searching} onSearch={handleSearch} />

            {error && (
              <Typography sx={{ color: "red", fontFamily: "monospace", px: 1 }}>{error}</Typography>
            )}

            {response && (
              <Typography sx={{ fontFamily: "monospace", fontSize: 12, color: "#555", px: 1 }}>
                Tìm thấy {response.total_sequences} chuỗi · xử lý trong {response.processing_time.toFixed(1)}s
              </Typography>
            )}

            <Box className="flex-1 min-h-0 border border-solid border-black rounded-[4px] flex flex-col">
              {response ? (
                <>
                  <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                    <Tab
                      label={`Chuỗi sự kiện (${response.temporal_sequences.length})`}
                      sx={{ fontFamily: "monospace", fontWeight: "bold" }}
                    />
                    {response.sequential_queries.map((q, i) => (
                      <Tab
                        key={q.step}
                        label={`Sự kiện ${q.step}: ${response.query_results[i]?.length ?? 0} kết quả`}
                        sx={{ fontFamily: "monospace" }}
                      />
                    ))}
                  </Tabs>

                  {/* wrapper này là vùng cuộn duy nhất của kết quả —
                      component bên trong phải cao tự nhiên (h-auto), không tự overflow */}
                  <Box className="flex-1 min-h-0 overflow-y-auto">
                    {tab === 0 && <TrakeSequences sequences={response.temporal_sequences} />}
                    {tab >= 1 && (
                      <ImageGallery
                        results={response.query_results[tab - 1] || []}
                        cols={5}
                        className="w-full h-auto"
                      />
                    )}
                  </Box>
                </>
              ) : (
                !searching && (
                  <Box className="flex-1 flex items-center justify-center">
                    <Typography sx={{ fontFamily: "monospace", fontStyle: "italic", color: "#777" }}>
                      Nhập các sự kiện rồi nhấn "Tìm kiếm" — kết quả chuỗi sự kiện sẽ hiện ở đây.
                    </Typography>
                  </Box>
                )
              )}

              {searching && (
                <Box className="flex-1 flex items-center justify-center">
                  <Typography sx={{ fontFamily: "monospace", color: "#1565c0" }}>
                    Đang tìm chuỗi sự kiện (Viterbi search có thể mất vài giây)…
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </IgnoreImageProvider>
      </IgnoreProvider>
    </SearchProvider>
  );
}
