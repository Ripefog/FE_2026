"use client";

import { Box, TextField, Button, Chip } from "@mui/material";
import { basicColors } from "@/constants/color";

import PopupAlert from "../utils/Popup";

import {
  useSearchContext,
  useSearchResultContext,
} from "@/contexts/searchContext";
import { useState } from "react";

import ResultModal from "../utils/SubmitTable";
import { useFetchIgnoredImages } from "@/hooks/getIgnoreInit";
import { CustomObject } from "@/types/Object";
import ObjectFilterScreen from "../objectFilter/ObjectFilterScreen";
import {
  ObjectFilterConstraint,
  ObjectFilters,
  CountMeta,
} from "@/types/Search";

function getContrastColor(bgColor: string) {
  // Bỏ dấu # nếu có
  const hex = bgColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Tính độ sáng theo công thức WCAG
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Ngưỡng khoảng 128-150 là phổ biến (ở đây dùng 128)
  return brightness > 128 ? "black" : "white";
}

// Hàm chuyển hex sang [R, G, B]
function hexToRgb(hex: string): [number, number, number] | null {
  const cleanHex = hex.replace(/^#/, "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function convertShapes(
  shapesOnCanvas: CustomObject[],
  countMeta: CountMeta,
  send2server: boolean = false
): ObjectFilters {
  const constraints: Record<string, ObjectFilterConstraint> = {};

  for (const shape of shapesOnCanvas) {
    let vec = hexToRgb(shape.color);
    let bbox = [
      Math.round(shape.x_min),
      Math.round(shape.y_min),
      Math.round(shape.x_max),
      Math.round(shape.y_max),
    ];

    if (shape.only_name) {
      vec = null;
      bbox = null;
    } else if (shape.only_bbox) {
      vec = null;
    } else if (shape.only_color) {
      bbox = null;
    }

    if (!constraints[shape.name]) {
      constraints[shape.name] = [];
    }
    constraints[shape.name].push([vec, bbox]);
  }

  const finalResult: ObjectFilters = {};
  for (const [name, cons] of Object.entries(constraints)) {
    const meta = countMeta[name] ?? {
      type: "count",
      value: cons.length,
      show_constraint: false,
    };

    const baseObj: any = {};

    // count / min_count / max_count
    if (meta.type === "count") {
      baseObj.count = meta.value;
    } else if (meta.type === "min_count") {
      baseObj.min_count = meta.value;
    } else if (meta.type === "max_count") {
      baseObj.max_count = meta.value;
    } else {
      // fallback an toàn
      baseObj.count = meta.value;
    }

    if (send2server) {
      // nếu gửi server → chỉ giữ constraint khi show_constraint = true
      baseObj.constraint = meta.show_constraint ? cons : [];
    } else {
      // nếu client → giữ constraint và flag
      baseObj.constraint = cons;
      baseObj.show_constraint = !!meta.show_constraint;
    }

    finalResult[name] = baseObj;
  }

  return finalResult;
}

export default function Filter() {
  const { query, mode, topK, dataSource, numQuery } = useSearchContext();
  const { results, searching, handleSearch } = useSearchResultContext();

  const [ocrQuery, setOcrQuery] = useState("");
  const [asrQuery, setAsrQuery] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [popupSeverity, setPopupSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");
  const [popupMessage, setPopupMessage] = useState("");
  const closeModal = () => {
    setIsOpen(false);
  };

  const [shapesOnCanvas, setShapesOnCanvas] = useState<CustomObject[]>([]);

  const validateFilters = () => {
    if (query.trim() === "") {
      return {
        valid: false,
        severity: "warning" as const,
        message: "Cần nhập câu truy vấn trước",
      };
    }

    if (queryName.trim() === "") {
      return {
        valid: false,
        severity: "warning" as const,
        message: "Chọn query name trước",
      };
    }

    const noFilters =
      shapesOnCanvas.length === 0 &&
      colors.length === 0 &&
      ocrQuery.trim() === "" &&
      asrQuery.trim() === "";

    if (noFilters) {
      return {
        valid: false,
        severity: "info" as const,
        message: "Cần chọn filter trước",
      };
    }

    return { valid: true } as const;
  };

  const { fetchIgnoredImages } = useFetchIgnoredImages();
  const onFilterClick = () => {
    const result = validateFilters();

    if (!result.valid) {
      setPopupSeverity(result.severity);
      setPopupMessage(result.message);
      setIsOpen(true);
      return;
    }

    const rgbColors: [number, number, number][] = colors.map((hex) =>
      hexToRgb(hex)
    );

    // const payload = {
    //     text_query: query,
    //     mode: mode,
    //     object_filters: convertShapes(shapesOnCanvas),
    //     color_filters: rgbColors,
    //     ocr_query: ocrQuery,
    //     asr_query: asrQuery,
    //     top_k: topK
    // }

    handleSearch({
      text_query: query,
      mode: mode,
      object_filters: convertShapes(shapesOnCanvas, countMeta, true),
      color_filters: rgbColors,
      ocr_query: ocrQuery,
      asr_query: asrQuery,
      top_k: topK,
      user_query: dataSource,
      num_query: numQuery,
    });

    fetchIgnoredImages(queryName);
  };

  const [colors, setColors] = useState<string[]>([]);
  const [currentColor, setCurrentColor] = useState("#000000");
  // Thêm màu vào list nếu chưa có
  const addColorToList = (newColor: string) => {
    setColors((prev) => {
      if (!prev.includes(newColor)) {
        return [...prev, newColor];
      }
      return prev; // tránh thêm trùng
    });
  };
  const removeColor = (c: string) => {
    setColors(colors.filter((col) => col !== c));
  };

  const [submit, setSubmit] = useState(false);
  const closeSubmitModal = () => {
    setSubmit(false);
  };
  const { queryName } = useSearchContext();
  const openSubmitModal = () => {
    if (results.length === 0) {
      setPopupSeverity("warning");
      setPopupMessage("Result rỗng. Cần nhấn Filter trước!");
      setIsOpen(true);
      return;
    }
    if (queryName === "") {
      setPopupSeverity("warning");
      setPopupMessage("Phải chọn Query name trước");
      setIsOpen(true);
      return;
    }
    setSubmit(true);
  };

  const [openObjectFilter, setOpenObjectFilter] = useState(false);
  const [countMeta, setCountMeta] = useState<CountMeta>({});

  return (
    <Box className="w-full h-full border border-solid border-black">
      <Box className="flex-1 flex flex-col justify-center items-center gap-1 p-2">
        <Box className="w-full flex gap-2 justify-around">
          <Box className="max-w-[150px] max-h-[250px] flex flex-col items-center">
            <Box className="w-full grid grid-cols-6">
              {basicColors.map((preset) => (
                <Box
                  key={preset}
                  onClick={() => {
                    setCurrentColor(preset);
                    addColorToList(preset);
                  }}
                  style={{
                    backgroundColor: preset,
                    width: 25,
                    height: 25,
                    borderRadius: 4,
                    cursor: "pointer",
                    border:
                      preset === currentColor
                        ? "3px solid black"
                        : "1px solid #ccc",
                  }}
                />
              ))}
            </Box>

            <TextField
              label="HEX"
              variant="filled"
              size="small"
              value={currentColor}
              onChange={(e) => {
                const val = e.target.value;
                setCurrentColor(val);
                if (/^#([0-9A-Fa-f]{6})$/.test(val)) {
                  // kiểm tra hex hợp lệ
                  addColorToList(val);
                }
              }}
              sx={{
                maxWidth: 100,
                "& .MuiInputBase-root": {
                  fontSize: "0.75rem", // chữ nhỏ
                  padding: "2px 6px", // khoảng cách nhỏ
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.7rem", // label nhỏ
                },
              }}
            />
          </Box>

          <Box className="flex flex-1 flex-col gap-1">
            <TextField
              label="OCR"
              variant="filled"
              className="w-[90%]"
              onChange={(e) => setOcrQuery(e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="ASR"
              variant="filled"
              className="w-[90%]"
              onChange={(e) => setAsrQuery(e.target.value)}
              size="small"
              fullWidth
            />

            <Box
              sx={{
                mt: 2,
                display: "flex",
                gap: 0.5,
                flexWrap: "wrap",
                maxHeight: "150px",
                overflow: "auto",
              }}
            >
              {colors.map((c) => {
                const contrast_color = getContrastColor(c);
                return (
                  <Chip
                    key={c}
                    label={c}
                    size="small" // Thu nhỏ chip
                    sx={{
                      backgroundColor: c,
                      color: contrast_color,
                      userSelect: "text", // Cho phép copy text
                      fontSize: "0.7rem", // chữ nhỏ hơn chút
                      height: 20, // thu chiều cao
                      minWidth: 60, // đặt chiều rộng tối thiểu
                      padding: "0 4px", // thu hẹp padding ngang
                      "& .MuiChip-label": {
                        padding: 0, // bỏ padding mặc định label
                      },
                      "& .MuiChip-deleteIcon": {
                        color: contrast_color,
                        fontSize: "1rem", // icon nhỏ hơn
                      },
                    }}
                    onDelete={() => removeColor(c)}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box className="flex justify-around w-full">
          <Box className="flex justify-center items-center gap-10">
            <Button
              variant="contained"
              onClick={onFilterClick}
              sx={{
                backgroundColor: searching ? "#9e9e9e" : "#1976d2",
              }}
            >
              {searching ? "filtering..." : "Filter"}
            </Button>

            <Button
              variant="contained"
              onClick={openSubmitModal}
              sx={{
                backgroundColor: "#ff4081", // Màu nền
                color: "white", // Màu chữ
                "&:hover": {
                  backgroundColor: "#f50057", // Màu khi hover
                },
                borderRadius: "50px", // Hình pill (dài và bo tròn)
              }}
            >
              Submit
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={() => setOpenObjectFilter(true)}
            sx={{
              backgroundColor: "#008000",
            }}
          >
            Object filter
          </Button>
        </Box>
      </Box>

      {isOpen && (
        <PopupAlert
          severity={popupSeverity}
          message={popupMessage}
          closeModal={closeModal}
        />
      )}

      {submit && (
        <ResultModal
          submit={submit}
          closeSubmitModal={closeSubmitModal}
          results={results}
          mode="Filter"
        />
      )}

      {openObjectFilter && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1300,
          }}
        >
          <Box
            className="w-[95vw] h-[90vh] bg-white flex justify-center items-center p-5"
            onClick={(e) => e.stopPropagation()} // chặn click bên trong popup làm đóng
          >
            <ObjectFilterScreen
              shapesOnCanvas={shapesOnCanvas}
              setShapesOnCanvas={setShapesOnCanvas}
              setOpenObjectFilter={setOpenObjectFilter}
              countMeta={countMeta}
              setCountMeta={setCountMeta}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
