import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type TranscriptEntry = {
  start: number;
  end: number;
  text: string;
};

interface TranscriptPanelProps {
  videoId: string;         // ex: "L26_V261"
  folder: string;          // ex: "L26"
  currentTimestamp: number | null;
}

export default function TranscriptPanel({ videoId, folder, currentTimestamp }: TranscriptPanelProps) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!videoId || !folder) return;

    const loadTranscript = async () => {
      setError(null);
      try {
        const res = await fetch(`/data/transcript/${folder}/${videoId}.json`);
        const data: Record<string, string> = await res.json();
        const parsed = Object.entries(data).map(([range, text]) => {
          const match = range.match(/\[(\d+\.?\d*)s\s*-\s*(\d+\.?\d*)s\]/);
          return {
            start: parseFloat(match?.[1] || "0"),
            end: parseFloat(match?.[2] || "0"),
            text,
          };
        });
        setTranscript(parsed);
      } catch (err) {
        console.warn(`Transcript not found for ${folder}/${videoId}.json`, err);
        setTranscript([]);
        setError("Không thể tải transcript cho video này.");
      }
    };

    loadTranscript();
  }, [videoId, folder]);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentTimestamp]);

  function formatDuration(seconds: number): string {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min} phút ${sec} giây`;
  }

  return (
    <>
      {/* 📊 Thống kê bên ngoài box */}
      {!error && transcript.length > 0 && (
        <Typography
          sx={{
            fontSize: 12,
            fontFamily: "monospace",
            color: "#311B92",
            fontWeight:'bold',
            mb: 1,
          }}
        >
          Tổng số đoạn hội thoại: {transcript.length} | Tổng thời lượng: {formatDuration(transcript[transcript.length - 1]?.end || 0)}
        </Typography>
      )}

      {/* 📄 Nội dung transcript */}
      <Box className="w-[100%] h-[90%] border border-solid border-black rounded-[2%] overflow-auto p-4">
        {error ? (
          <Typography sx={{ fontFamily: "monospace", fontStyle: "italic", color: "red" }}>
            {error}
          </Typography>
        ) : transcript.length === 0 ? (
          <Typography sx={{ fontFamily: "monospace", fontStyle: "italic", color: "#777" }}>
            Không có transcript nào.
          </Typography>
        ) : (
          transcript.map((entry, idx) => {
            const isActive =
              currentTimestamp !== null &&
              currentTimestamp >= entry.start &&
              currentTimestamp < entry.end;

            return (
              <Typography
                key={idx}
                ref={isActive ? activeRef : null}
                sx={{
                  fontSize: 14,
                  fontFamily: "monospace",
                  p: 1,
                  backgroundColor: isActive ? "yellow" : "transparent",
                  borderRadius: 2,
                }}
              >
                [{entry.start}s - {entry.end}s] {entry.text}
              </Typography>
            );
          })
        )}
      </Box>
    </>
  );
}
