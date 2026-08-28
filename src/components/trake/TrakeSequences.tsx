"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { TemporalSequence } from "@/types/Trake";
import { base_folder } from "@/constants/keyframe";
import CheckVideo from "../imageGalllery/CheckVideo";
import { Item } from "@/types/Query";

import assetsIndexL from "@/data/assetsIndex_L.json";
import assetsIndexK from "@/data/assetsIndex_K01_K20.json";

// gộp 2 index như ImageGallery
const assetsIndex: Record<string, any> = { ...assetsIndexL, ...assetsIndexK };

function getFirstPart(name: string) {
  return name.split("_")[0];
}

function getFirstTwoParts(name: string) {
  return name.split("_").slice(0, 2).join("_");
}

function keyframeSrc(filename: string) {
  // base_folder đã có "/" cuối — không ghép thêm "/" nữa (tránh "//" làm mất viền vàng trong CheckVideo)
  const base = base_folder.endsWith("/") ? base_folder : `${base_folder}/`;
  return `${base}${getFirstPart(filename)}/${getFirstTwoParts(filename)}/${filename}`;
}

function groupImagesOf(filename: string): string[] {
  try {
    const part = getFirstPart(filename);
    const group = getFirstTwoParts(filename);
    return assetsIndex[part][group]["_files"].map((img: string) => `/assets/${part}/${group}/${img}`);
  } catch {
    console.warn("Group not found in assetsIndex:", filename);
    return [];
  }
}

export default function TrakeSequences({ sequences }: { sequences: TemporalSequence[] }) {
  const [openImage, setOpenImage] = useState<Item | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // đóng viewer cũ khi chạy search mới
    setOpenImage(null);
  }, [sequences]);

  const openStep = (keyframe_id: string, timestamp: number) => {
    setOpenImage({ img: keyframeSrc(keyframe_id), title: keyframe_id });
    setCurrentTimestamp(timestamp);
  };

  if (sequences.length === 0) {
    return (
      <Typography sx={{ fontFamily: "monospace", fontStyle: "italic", color: "#777", p: 2 }}>
        Không tìm thấy chuỗi sự kiện nào thỏa ràng buộc thời gian — thử tăng "Max gap" hoặc "Top K
        / query".
      </Typography>
    );
  }

  return (
    // không tự overflow — wrapper tab ở page mới là vùng cuộn (tự overflow ở đây sẽ
    // khiến chiều cao tự giãn ra ngoài khung và bị cắt, không cuộn được)
    <Box className="w-full flex flex-col gap-2 p-2">
      {sequences.map((seq) => (
        <Card key={seq.sequence_id} variant="outlined">
          <CardContent className="!pb-2">
            {/* header: điểm + thời gian của cả chuỗi */}
            <Box className="flex items-center gap-1 flex-wrap" sx={{ mb: 1 }}>
              <Chip label={`#${seq.sequence_id}`} size="small" color="primary" />
              <Chip label={seq.video_id} size="small" sx={{ fontFamily: "monospace", fontWeight: "bold" }} />
              <Chip
                size="small"
                label={`Score: ${seq.sequence_score.toFixed(4)}`}
                variant="outlined"
                color="success"
              />
              <Chip
                size="small"
                label={`Temporal consistency: ${seq.temporal_consistency.toFixed(3)}`}
                variant="outlined"
              />
              {seq.time_gaps.map((g, i) => (
                <Chip key={i} size="small" label={`gap ${i + 1}→${i + 2}: ${g.toFixed(1)}s`} variant="outlined" />
              ))}
              <Chip size="small" label={`Tổng: ${seq.total_duration.toFixed(1)}s`} variant="outlined" />
            </Box>

            {/* các bước theo thứ tự thời gian — click mở viewer toàn video */}
            <Box className="flex items-stretch gap-1 overflow-x-auto">
              {seq.steps.map((st, i) => (
                <Box key={st.step} className="flex items-center gap-1">
                  <Box
                    onClick={() => openStep(st.keyframe_id, st.timestamp)}
                    sx={{
                      cursor: "pointer",
                      border: "2px solid #1565c0",
                      borderRadius: 1,
                      p: 0.5,
                      minWidth: 170,
                      "&:hover": { backgroundColor: "#e3f2fd" },
                    }}
                    title={st.text_query}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: "bold", color: "#1565c0", fontFamily: "monospace" }}>
                      Bước {st.step}: {st.text_query.length > 28 ? st.text_query.slice(0, 28) + "…" : st.text_query}
                    </Typography>
                    <img
                      src={keyframeSrc(st.keyframe_id)}
                      alt={st.keyframe_id}
                      loading="lazy"
                      className="w-full h-auto aspect-video object-cover"
                    />
                    <Typography sx={{ fontSize: 10, fontFamily: "monospace", color: "#444" }}>
                      t = {st.timestamp.toFixed(1)}s · score {st.score.toFixed(4)}
                    </Typography>
                  </Box>
                  {i < seq.steps.length - 1 && <ArrowForwardIcon sx={{ color: "#888" }} />}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      ))}

      <CheckVideo
        openImage={openImage}
        setOpenImage={setOpenImage}
        groupImages={openImage ? groupImagesOf(openImage.title) : []}
        currentTimestamp={currentTimestamp}
        setCurrentTimestamp={setCurrentTimestamp}
      />
    </Box>
  );
}
