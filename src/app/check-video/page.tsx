"use client";

import { useState, useEffect } from "react";
import CheckImage from "@/components/imageGalllery/CheckVideo";
import { 
  Box, 
  Button, 
  TextField, 
  Typography,
  Chip
} from "@mui/material";
import TimestampFrameConverter from "@/components/utils/TimestampFrameConverter";
import Sidebar from "@/components/utils/Siderbar";
import { fps } from "@/constants/fps";

import assetsIndexL from "@/data/assetsIndex_L.json";
import assetsIndexK from "@/data/assetsIndex_K01_K20.json";

export default function Check() {
  const [videoId, setVideoId] = useState("");      // ví dụ: L26_V001
  const [timestamp, setTimestamp] = useState("");  // ví dụ: 12.34, .54, 7, etc.

  const [openImage, setOpenImage] = useState<{ img: string; title: string } | null>(null);
  const [groupImages, setGroupImages] = useState<string[]>([]);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  const [assetsIndex, setAssetsIndex] = useState<Record<string, any> | null>(null);

  // Gộp index L + K
  useEffect(() => {
    setAssetsIndex({ ...assetsIndexL, ...assetsIndexK });
  }, []);

  // Helpers
  const getFirstPart = (id: string): string => id.split("_")[0] || "";             // L26
  const getFirstTwoParts = (id: string): string => {                               // L26_V001
    const parts = id.split("_");
    return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : id;
  };

  // Chuẩn hóa input timestamp -> số giây (number). Rỗng/không hợp lệ -> 0
  const normalizeSeconds = (raw: string): number => {
    if (!raw) return 0;
    let s = raw.trim().replace(",", ".");      // hỗ trợ nhập 12,3
    if (s.startsWith(".")) s = "0" + s;        // .54 -> 0.54
    // giữ lại chữ số và dấu .
    s = s.replace(/[^\d.]/g, "");
    const n = parseFloat(s);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  // Tạo "0000.00" từ số giây
  const padTimestamp = (secs: number): string => {
    const fixed = secs.toFixed(2);             // "12.30"
    const [intPart, fracPart] = fixed.split(".");
    const intPadded = intPart.padStart(4, "0"); // "0012"
    return `${intPadded}.${fracPart}`;         // "0012.30"
  };

  // Tạo keyframe filename: "<videoId>_0000.00s.jpg"
  const buildKeyframeId = (vId: string, secs: number): string =>
    `${vId}_${padTimestamp(secs)}s.jpg`;

  // Lấy toàn bộ ảnh thuộc group (video)
  const listGroupImages = (vId: string): string[] => {
    if (!assetsIndex) return [];
    const folder = getFirstPart(vId);           // "L26"
    const group = getFirstTwoParts(vId);        // "L26_V001"
    try {
      const files: string[] = assetsIndex[folder][group]["_files"] || [];
      return files.map((img) => `/assets/${folder}/${group}/${img}`);
    } catch {
      console.warn("Group not found in assetsIndex:", vId);
      return [];
    }
  };

  // Nhấn "Xem"
  const handleLoad = () => {
    if (!videoId) return;                       // cần videoId
    const secs = normalizeSeconds(timestamp);   // rỗng -> 0
    const kfId = buildKeyframeId(videoId, secs);

    const folder = getFirstPart(videoId);
    const basePath = `/assets/${folder}/${videoId}`;
    const fullImagePath = `${basePath}/${kfId}`;

    const group = listGroupImages(videoId);

    setGroupImages(group);
    setOpenImage({ img: fullImagePath, title: kfId });
    setCurrentTimestamp(secs);                  // đồng bộ transcript
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
           
  function getFpsForVideo(video_id: string): number | null {
    if (fps[`${video_id}.mp4`] !== undefined) return fps[`${video_id}.mp4`];
    if (fps[video_id] !== undefined) return fps[video_id];
    return null;
  }
  

  return (
    <Box sx={{ p: 2 }}>
      <Sidebar open={drawerOpen} setOpen={setDrawerOpen}/>
      
      <Typography variant="h6" sx={{ mb: 2, fontFamily: "monospace", textAlign:'center' }}>
        Kiểm tra keyframe theo video và timestamp
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", mb: 2 }}>
        <TextField
          label="Video ID (ví dụ: L26_V001)"
          value={videoId}
          onChange={(e) => setVideoId(e.target.value.trim())}
          size="small"
          sx={{ width: 220 }}
        />

        {videoId && (
            <Chip
              label={`FPS: ${getFpsForVideo(videoId) ?? "N/A"}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "bold" }}
            />
        )}
        

        <TextField
          label="Timestamp (vd: 12.34 hoặc .54, để trống mặc định là 0)"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          size="small"
          sx={{
            width: 350,
            "& .MuiInputLabel-root": {
              fontSize: "13px",   // 👈 chỉnh nhỏ hơn
            },
          }}
        />
        
        <Button variant="contained" onClick={handleLoad}>
          Xem
        </Button>
      </Box>

      {videoId && <TimestampFrameConverter fps={getFpsForVideo(videoId)} />}

      <CheckImage
        openImage={openImage}
        setOpenImage={setOpenImage}
        groupImages={groupImages}
        currentTimestamp={currentTimestamp}
        setCurrentTimestamp={setCurrentTimestamp}
      />
    </Box>
  );
}
