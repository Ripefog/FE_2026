import { Box, Typography, Dialog, Chip } from "@mui/material";
import TranscriptPanel from "@/components/imageGalllery/TransciptPanel";
import { fps } from "@/constants/fps";
function getFpsForVideo(video_id: string): number | null {
  if (fps[`${video_id}.mp4`] !== undefined) return fps[`${video_id}.mp4`];
  if (fps[video_id] !== undefined) return fps[video_id];
  return null;
}
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import TimestampFrameConverter from "@/components/utils/TimestampFrameConverter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface CheckVideoProps {
  openImage: { img: string; title: string } | null;
  setOpenImage: (val: { img: string; title: string } | null) => void;
  groupImages: string[];
  currentTimestamp: number | null;
  setCurrentTimestamp: (val: number) => void;
}

// Hàm đọc file từ public (client-side)
const getVideoContent = async (videoId: string, folder: string): Promise<string> => { 
  try {
    const res = await fetch(`/data/transcript_summary_gemini/analysis_${folder}.txt`);
    if (!res.ok) throw new Error("Không tìm thấy file txt");
    const text = await res.text();

    const lines = text.split("\n");
    let inside = false;
    const content: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (line.startsWith("## ")) {
        const currentId = line.replace("## ", "").trim();

        if (currentId === videoId) {
          inside = true;
          content.push(rawLine); // ✅ thêm dòng tiêu đề vào kết quả
          continue;
        } else if (inside) {
          break; // đã xong block
        }
      }

      if (inside && !/^=+$/.test(line)) {
        content.push(rawLine);
      }
    }

    return content.join("\n").trim();
  } catch (err) {
    console.error("❌ Lỗi đọc file:", err);
    return "";
  }
};


export default function CheckVideo({
  openImage,
  setOpenImage,
  groupImages,
  currentTimestamp,
  setCurrentTimestamp,
}: CheckVideoProps) {
  const getTimestampFromFilename = (filename: string): string => {
    const match = filename.match(/_(\d+\.\d+)s\.jpg$/);
    return match ? match[1] : "0.00";
  };

  const getFirstPart = (filename: string): string => {
    return filename.split("_")[0] || "";
  };

  const getFirstTwoParts = (filename: string): string => {
    const parts = filename.split("_");
    return parts.length >= 2 ? `${parts[0]}_${parts[1]}` : filename;
  };


  const [analysis, setAnalysis] = useState("");



  useEffect(() => {
    if (openImage) {
      const videoId = getFirstTwoParts(openImage.title);
      const folder = getFirstPart(openImage.title);
      getVideoContent(videoId, folder).then(setAnalysis);
    }
  }, [openImage]);

  // ref mảng cho tất cả thumbnail
  const thumbRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const containerRef = useRef<HTMLDivElement | null>(null);


  useLayoutEffect(() => {
    if (!openImage) return;

    const file2 = openImage.img.split("/").pop();
    const delay = Math.floor(groupImages.length / 500) * 500 * 4;

    // trì hoãn 1 tick để chắc chắn ref đã được gắn
    setTimeout(() => {
      const el = file2 ? thumbRefs.current[file2] : null;
      const container = containerRef.current;
      if (el && container) {
        container.scrollTo({
          left: el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2,
          behavior: "smooth",
        });

      } else {
      }
    }, delay);
  }, [openImage]);
//   useLayoutEffect(() => {
//   if (!openImage) return;

//   const file2 = openImage.img.split("/").pop();
//   const el = file2 ? thumbRefs.current[file2] : null;
//   const container = containerRef.current;

//   if (el && container) {
//     container.scrollTo({
//       left: el.offsetLeft - container.clientWidth / 2 + el.clientWidth / 2,
//       behavior: "smooth",
//     });
//   }
// }, [openImage]);






  return (
    <Dialog
      open={!!openImage}
      onClose={() => setOpenImage(null)}
      // fullScreen
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "90vw",
          height: "100vh",
          maxHeight: "100vh",
          margin: 0,
          borderRadius: 0,
        },
      }}
      slotProps={{ transition: { timeout: 0 } }}
      slots={{ transition: undefined }}
    >
      {openImage && (
        <Box className="flex w-full h-full gap-2 p-2 overflow-hidden">
          {/* Transcript bên trái */}
          <Box
            className="h-full overflow-y-auto border border-solid border-gray-300 rounded p-2"
            sx={{
              width: "20%",
              minWidth: 280,
              fontFamily: "monospace",
              fontSize: 14,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.6,
            }}
          >
            <TranscriptPanel
              videoId={getFirstTwoParts(openImage.title)}
              folder={getFirstPart(openImage.title)}
              currentTimestamp={currentTimestamp}
            />
          </Box>

          {/* Ảnh và danh sách bên phải */}
          <Box className="flex-1 h-full overflow-auto p-2">
            <img
              src={openImage.img}
              alt={openImage.title}
              loading="lazy"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
                maxHeight: "70vh",
                objectFit: "contain",
              }}
            />
            <Typography sx={{ mt: 1, textAlign: "center", fontFamily: "monospace" }}>
              {openImage.title}
            </Typography>

            <Box sx={{ textAlign: "center", mt: 2, mb: 1 }}>
              <Typography
                sx={{
                  fontSize: 12,
                  fontFamily: "monospace",
                  color: "#888",
                  display: "inline-block",
                  mr: 1,
                }}
              >
                Tổng số keyframe: {groupImages.length}
              </Typography>

              {(() => {
                const fpsVal = getFpsForVideo(getFirstTwoParts(openImage.title));
                return fpsVal ? (
                  <Chip
                    label={`FPS: ${fpsVal}`}
                    size="small"
                    sx={{
                      backgroundColor: "#1a1a1a",     // đen xám dịu hơn
                      color: "#76ff03",              // neon xanh lá nhưng nhạt
                      fontWeight: "bold",
                      border: "1px solid #76ff03",   // viền neon
                      borderRadius: "8px",
                      letterSpacing: "0.5px",
                    }}
                  />
                ) : null;
              })()}
            </Box>


            {getFpsForVideo(getFirstTwoParts(openImage.title)) && <TimestampFrameConverter fps={getFpsForVideo(getFirstTwoParts(openImage.title))} />}


            <Box ref={containerRef} sx={{ display: "flex", gap: 1, overflowX: "auto", mt: 2 }}>
              {groupImages.map((src, idx) => {
                const filename = src.split("/").pop() || "";
                
                
                return (
                  <div
                    key={src}
                    style={{ flex: "0 0 auto" }}
                    className="flex flex-col items-center"
                  >
                    <img
                      ref={(el) => {
                        const filename = src.split("/").pop() || "";
                        thumbRefs.current[filename] = el;
                      }}

                      src={src}
                      alt={filename}
                      style={{
                        height: 80,
                        width: "auto",
                        display: "block",
                        borderRadius: 6,
                        cursor: "pointer",
                        border:
                          openImage.img === src
                            ? "5px solid yellow"
                            : "1px solid #ccc",
                      }}
                      onClick={() => {
                        setOpenImage({ img: src, title: filename });
                        const timestamp = parseFloat(getTimestampFromFilename(filename));
                        setCurrentTimestamp(timestamp);
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "10px",
                        fontFamily: "monospace",
                        color: "#666",
                        mt: 0.5,
                      }}
                    >
                      {getTimestampFromFilename(src)}
                    </Typography>
                  </div>
                );
              })}
            </Box>
          </Box>

          {/* Transcript summary gemini */}
          <Box
            className="h-full border border-solid border-gray-300 rounded"
            sx={{
              width: "20%",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",   // chia dọc: header + body
              backgroundColor: "#fafafa",
              fontFamily: "monospace",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#333",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                backgroundColor: "#fff",
                borderBottom: "1px solid #ddd",
                borderRadius: "6px 6px 0 0",
                p: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Transcript summary Gemini
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: 2,
                backgroundColor: "#fafafa",
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => (
                    <Typography
                      variant="h6"
                      sx={{
                        mt: 2,
                        mb: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "18px",
                        color: "#FB8C00",           // cam sáng
                        backgroundColor: "#FFE0B2", // cam nhạt
                      }}
                      {...props}
                    />
                  ),

                  strong: ({ node, ...props }) => {
                    const text = String(props.children);

                    if (text.endsWith(":")) {
                      const depth = node?.position?.start?.column ?? 1;

                      let color = "#F4511E"; // cam cháy mặc định
                      let bg = "#FFCCBC";    // nền cam pastel
                      let fontSize = "16px";

                      if (depth <= 3) {
                        color = "#E53935";  // đỏ tươi
                        bg = "#FFCDD2";     // đỏ nhạt
                        fontSize = "18px";
                      } else if (depth <= 5) {
                        color = "#00838F";  // cyan đậm
                        bg = "#B2EBF2";     // cyan nhạt
                        fontSize = "16px";
                      }

                      return (
                        <span
                          style={{
                            display: "block",
                            marginTop: "12px",
                            marginBottom: "6px",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                            fontSize,
                            lineHeight: 1.7,
                            color,
                            backgroundColor: bg,
                          }}
                          {...props}
                        />
                      );
                    }

                    // bold thường
                    return (
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          lineHeight: 1.7,
                          color: "#000",
                        }}
                        {...props}
                      />
                    );
                  },

                  li: ({ node, ...props }) => (
                    <li
                      style={{
                        marginBottom: "8px",
                        fontSize: "15px",
                        lineHeight: 1.7,
                      }}
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => (
                    <Typography sx={{ mb: 1, fontSize: 15, lineHeight: 1.7 }} {...props} />
                  ),
                }}
              >
                {analysis}
              </ReactMarkdown>
            </Box>

          </Box>




        </Box>
      )}
    </Dialog>
  );
}
