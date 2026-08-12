"use client";

import { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";

interface Props {
  fps: number | null;
}

export default function TimestampFrameConverter({ fps }: Props) {
  const [calcTimestamp, setCalcTimestamp] = useState("");
  const [frameId, setFrameId] = useState("");
  const [minuteSecond, setMinuteSecond] = useState("");
  const [convertMode, setConvertMode] = useState<"ts-to-frame" | "frame-to-ts">("ts-to-frame");

  useEffect(() => {
    if (!fps || isNaN(fps)) return;

    if (convertMode === "ts-to-frame" && calcTimestamp) {
      const ts = parseFloat(calcTimestamp);
      if (!isNaN(ts)) {
        setFrameId(String(Math.floor(ts * fps))); // frame luôn là số nguyên
      } else {
        setFrameId("");
      }
    } else if (convertMode === "frame-to-ts" && frameId) {
      const frame = parseInt(frameId, 10);
      if (!isNaN(frame)) {
        const ts = frame / fps;
        setCalcTimestamp(ts.toFixed(2));
        setMinuteSecond(formatTimestampNatural(ts));
      } else {
        setCalcTimestamp("");
        setMinuteSecond("");
      }
    }
  }, [calcTimestamp, frameId, convertMode, fps]);

  function formatTimestampNatural(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    if (minutes > 0) {
      return `${minutes} phút ${secs} giây`;
    }
    return `${secs} giây`;
  }

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", mb: 2 }}>
      {convertMode === "ts-to-frame" ? (
        <TextField
          label="Timestamp (s)"
          value={calcTimestamp}
          onChange={(e) => setCalcTimestamp(e.target.value)}
          size="small"
          sx={{ width: 200 }}
        />
      ) : (
        <TextField
          label="Frame ID"
          value={frameId}
          onChange={(e) => setFrameId(e.target.value)}
          size="small"
          sx={{ width: 200 }}
        />
      )}

      <Button
        variant="outlined"
        onClick={() =>
          setConvertMode(convertMode === "ts-to-frame" ? "frame-to-ts" : "ts-to-frame")
        }
      >
        ⇄
      </Button>

      {convertMode === "ts-to-frame" ? (
        <TextField
          label="Frame ID"
          value={frameId}
          size="small"
          sx={{ width: 200 }}
          InputProps={{ readOnly: true }}
        />
      ) : (
        <>
          <TextField
            label="Timestamp (s)"
            value={calcTimestamp}
            size="small"
            sx={{ width: 200 }}
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Timestamp (tự nhiên)"
            value={minuteSecond}
            size="small"
            sx={{ width: 200 }}
            InputProps={{ readOnly: true }}
          />
        </>
      )}
    </Box>
  );
}
