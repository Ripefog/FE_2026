"use client";

import { useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  TextField,
  Chip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { fps } from "@/constants/fps";
import Sidebar from "@/components/utils/Siderbar";

interface Row {
  id: number;
  order: number;
  video_id: string;
  frame_id: string;
  qa_text?: string;
  [key: string]: any; // cho phép thêm frame_id_1, frame_id_2...
}
import ExportButton from "@/components/utils/ExportButton"

export default function SubmitPage() {
  const [videoId, setVideoId] = useState("");
  const [frameId, setFrameId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [queryName, setQueryName] = useState("submission");
  const [mode, setMode] = useState<"qa" | "trake" | null>(null);
  const [eventCount, setEventCount] = useState<number>(2);
  const [trakeFrames, setTrakeFrames] = useState<string[]>([]);



const generateRows = (maxFrameId: number) => {
  const newRows: Row[] = [];

  const baseFrame = parseInt(frameId, 10);
  if (isNaN(baseFrame)) return;

  // hàng 1: input
  newRows.push({
    id: 0,
    order: 1,
    video_id: videoId,
    frame_id: String(baseFrame),
    qa_text: "",
  });

  // hàng 2–5: trống
  // for (let i = 2; i <= 5; i++) {
  //   newRows.push({
  //     id: i - 1,
  //     order: i,
  //     video_id: videoId,
  //     frame_id: "",
  //     qa_text: "",
  //   });
  // }

  const fpsVal = getFpsForVideo?.(videoId) ?? 1;
  let offset = 1;
  let mode: "normal" | "onlyUp" | "onlyDown" = "normal";

  for (let i = 2; i <= 100; i++) {
    let val: number;

    if (mode === "normal") {
      const isEven = i % 2 === 0;
      val = isEven
        ? baseFrame + offset * fpsVal
        : baseFrame - offset * fpsVal;

      if (val <= 0) {
        val = 0;
        mode = "onlyUp";
      } else if (val >= maxFrameId) {
        val = maxFrameId;
        mode = "onlyDown";
      }

      if (!isEven) offset++; // sau khi có cặp thì tăng offset
    } else if (mode === "onlyUp") {
      val = baseFrame + offset * fpsVal;
      if (val >= maxFrameId) val = maxFrameId;
      offset++;
    } else {
      val = baseFrame - offset * fpsVal;
      if (val <= 0) val = 0;
      offset++;
    }

    newRows.push({
      id: i - 1,
      order: i,
      video_id: videoId,
      frame_id: String(val),
      qa_text: "",
    });
  }

  setRows(newRows);
};



  const downloadCSV = () => {
    if (!rows || rows.length === 0) {
      alert("❌ Không có dữ liệu để download!");
      return;
    }


    let lines: string[];

    if (mode === "qa") {
      lines = rows.map(
        (r) =>
          `${r.video_id},${r.frame_id},"${(r.qa_text ?? "").replace(/"/g, '""')}"`
      );
    } else if (mode === "trake") {
      lines = rows.map((r) => {
        const values = [r.video_id];
        for (let i = 1; i <= eventCount; i++) {
          values.push(r[`frame_id_${i}`] ?? "");
        }
        return values.join(",");
      });
    } else {
      lines = rows.map((r) => `${r.video_id},${r.frame_id}`);
    }

    const content = lines.join("\r\n");

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${queryName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const baseColumns: GridColDef[] = [
    { field: "order", headerName: "#", width: 80 },
    { field: "video_id", headerName: "Video ID", flex: 1, editable: true },
    { field: "frame_id", headerName: "Frame ID", flex: 1, editable: true },
  ];

  const columns: GridColDef[] =
    mode === "qa"
      ? [
          ...baseColumns,
          { field: "qa_text", headerName: "QA Text", flex: 2, editable: true },
        ]
      : mode === "trake"
      ? [
          { field: "order", headerName: "#", width: 80 },
          { field: "video_id", headerName: "Video ID", flex: 1, editable: true },
          ...Array.from({ length: eventCount }, (_, i) => ({
            field: `frame_id_${i + 1}`,
            headerName: `Frame ${i + 1}`,
            flex: 1,
            editable: true,
          })),
        ]
      : baseColumns;

  function getFpsForVideo(video_id: string): number | null {
    if (fps[`${video_id}.mp4`] !== undefined) return fps[`${video_id}.mp4`];
    if (fps[video_id] !== undefined) return fps[video_id];
    return null;
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  
  return (
    <Box className="p-4 space-y-4">
        <Sidebar open={drawerOpen} setOpen={setDrawerOpen}/>

        {/* Hàng 1: Điều khiển */}
        <Box className="flex flex-wrap justify-center items-center gap-4 mb-4">
          <Button
            variant="contained"
            color="error"
            onClick={() => setRows([])}
          >
            Xóa tất cả
          </Button>

          <TextField
            label="File Name"
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
            size="small"
          />

          {videoId && (
            <Chip
              label={`FPS: ${getFpsForVideo(videoId) ?? "N/A"}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={mode === "qa"}
                onChange={(e) => {
                  setMode(e.target.checked ? "qa" : null);
                  setTrakeFrames([]);
                }}
              />
            }
            label="Enable QA"
          />

          <FormControlLabel
            control={
              <Switch
                checked={mode === "trake"}
                onChange={(e) => {
                  setMode(e.target.checked ? "trake" : null);
                  setTrakeFrames([]);
                }}
              />
            }
            label="Enable TRAKE"
          />

          {mode === "trake" && (
            <TextField
              label="Số lượng event"
              type="number"
              value={eventCount}
              onChange={(e) => setEventCount(Number(e.target.value))}
              size="small"
              sx={{ width: 150 }}
            />
          )}



          <Button
  variant="contained"
  onClick={async () => {
    if (!videoId) {
      console.warn("❌ Chưa nhập videoId");
      return;
    }

    const res = await fetch(`/api/max-frame-id?videoId=${videoId}`);
    const data = await res.json();

    if (data.error) {
      console.error("Lỗi:", data.error);
      return;
    }

    console.log(`max frame id cho ${videoId} là ${data.maxFrameId} (từ timestamp ${data.timestamp}s, fps=${data.fps})`);

    generateRows(data.maxFrameId);
  }}
>
  Generate
</Button>




        </Box>

        {/* Hàng 2: Input dữ liệu */}
        <Box className="flex flex-wrap justify-center items-center gap-2">
          <TextField
            label="Video ID"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            size="small"
          />

          {mode === "trake" ? (
            <Box className="flex flex-wrap gap-2">
              {Array.from({ length: eventCount }, (_, i) => (
                <TextField
                  key={i}
                  label={`Frame ${i + 1}`}
                  size="small"
                  value={trakeFrames[i] ?? ""}
                  onChange={(e) => {
                    const updated = [...trakeFrames];
                    updated[i] = e.target.value;
                    setTrakeFrames(updated);
                  }}
                />
              ))}
            </Box>
          ) : (
            <TextField
              label="Frame ID"
              value={frameId}
              onChange={(e) => setFrameId(e.target.value)}
              size="small"
            />
          )}
        </Box>


        <div style={{ height: 500, width: "100%" }}>
            <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[10, 25, 50, 100]}
            processRowUpdate={(newRow, oldRow) => {
                const updatedRows = rows.map((row) =>
                row.id === oldRow.id ? { ...row, ...newRow } : row
                );
                setRows(updatedRows);
                return newRow;
            }}
            onProcessRowUpdateError={(error) => {
                console.error("Update error:", error);
            }}
            editMode="cell"
            />
        </div>

        <Box className="flex justify-between">
          <Button
            variant="contained"
            onClick={downloadCSV}
            sx={{ 
              backgroundColor: "orange",
              color:'black', 
              "&:hover": { backgroundColor: "#fb8c00" } }}
          >
              Download CSV
          </Button>
          
          <ExportButton
            rows={rows}
            queryName={queryName}
            mode={mode}
            eventCount={eventCount}
          />
        </Box>
    </Box>
  );
}
