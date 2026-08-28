"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";

import PopupAlert from "../utils/Popup";
import { TrakeSearchPayload } from "@/types/Trake";

type Props = {
  searching: boolean;
  onSearch: (payload: TrakeSearchPayload) => void;
};

const MAX_EVENTS = 8;

export default function TrakeSearchBar({ searching, onSearch }: Props) {
  // mỗi phần tử = text query cho 1 sự kiện, theo thứ tự thời gian
  const [events, setEvents] = useState<string[]>(["", "", ""]);
  const [mode, setMode] = useState("hybrid"); // BE mặc định hybrid (RRF MetaCLIP2 + SigLIP2)
  const [topKPerQuery, setTopKPerQuery] = useState("50"); // 1..1000 (BE cũ giới hạn 200 — cần nâng Field le= ở BE)
  const [minGap, setMinGap] = useState("1");
  const [maxGap, setMaxGap] = useState("300");
  const [topSeq, setTopSeq] = useState("10"); // 1..50

  const [isOpen, setIsOpen] = useState(false);
  const [popupSeverity, setPopupSeverity] = useState<"success" | "info" | "warning" | "error">("warning");
  const [popupMessage, setPopupMessage] = useState("");
  const showPopup = (msg: string) => {
    setPopupMessage(msg);
    setIsOpen(true);
  };

  const setEvent = (i: number, val: string) =>
    setEvents((prev) => prev.map((e, j) => (j === i ? val : e)));

  const onSearchClick = () => {
    // bỏ qua event trống, đánh số lại step từ 1 theo thứ tự nhập
    const filled = events.map((e) => e.trim()).filter((e) => e !== "");
    if (filled.length < 2) {
      showPopup("TRAKE cần ít nhất 2 sự kiện (không trống) để tìm chuỗi theo thời gian");
      return;
    }
    if (filled.some((e, i) => filled.indexOf(e) !== i)) {
      showPopup("Các sự kiện không được trùng nhau");
      return;
    }
    const minG = parseFloat(minGap);
    const maxG = parseFloat(maxGap);
    if (isNaN(minG) || isNaN(maxG) || minG < 0.1 || maxG < minG) {
      showPopup("Khoảng cách thời gian không hợp lệ (min ≥ 0.1s và min < max)");
      return;
    }
    const kq = parseInt(topKPerQuery, 10);
    if (isNaN(kq) || kq < 1 || kq > 1000) {
      showPopup("Top K mỗi query phải từ 1 đến 1000");
      return;
    }
    const ts = parseInt(topSeq, 10);
    if (isNaN(ts) || ts < 1 || ts > 50) {
      showPopup("Số sequences phải từ 1 đến 50");
      return;
    }

    onSearch({
      sequential_queries: filled.map((text, i) => ({ step: i + 1, text_query: text })),
      mode,
      top_k_per_query: kq,
      min_time_gap: minG,
      max_time_gap: maxG,
      top_sequences: ts,
    });
  };

  return (
    <Box className="w-full p-2 border border-solid border-black">
      <Typography sx={{ fontWeight: "bold", fontFamily: "monospace", mb: 1 }}>
        TRAKE — Temporal Multi-Event Search
      </Typography>
      <Typography sx={{ fontSize: 12, color: "#555", mb: 1, fontFamily: "monospace" }}>
        Nhập các sự kiện theo thứ tự thời gian — BE tìm chuỗi keyframe trong cùng 1 video sao cho
        khung của sự kiện i luôn xảy ra trước khung của sự kiện i+1 (Viterbi + ràng buộc khoảng cách thời gian).
      </Typography>

      {/* các sự kiện theo thứ tự */}
      <Box className="flex flex-col gap-1">
        {events.map((ev, i) => (
          <Box key={i} className="flex items-center gap-2">
            <Typography sx={{ minWidth: 90, fontFamily: "monospace", fontWeight: "bold", color: "#1565c0" }}>
              Sự kiện {i + 1}
            </Typography>
            <TextField
              label={`Mô tả sự kiện ${i + 1}`}
              variant="filled"
              size="small"
              fullWidth
              value={ev}
              onChange={(e) => setEvent(i, e.target.value)}
            />
            <Tooltip title="Xóa sự kiện">
              <span>
                <IconButton
                  size="small"
                  disabled={events.length <= 2}
                  onClick={() => setEvents((prev) => prev.filter((_, j) => j !== i))}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Box className="flex justify-between items-center mt-2 gap-2 flex-wrap">
        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={events.length >= MAX_EVENTS}
          onClick={() => setEvents((prev) => [...prev, ""])}
        >
          Thêm sự kiện
        </Button>

        {/* chọn mode — same enum như /search */}
        <FormControl>
          <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <FormControlLabel value="metaclip2" control={<Radio size="small" />} label="MetaCLIP2" />
            <FormControlLabel value="siglip2" control={<Radio size="small" />} label="SigLIP 2" />
            <FormControlLabel value="hybrid" control={<Radio size="small" />} label="Hybrid" />
          </RadioGroup>
        </FormControl>

        <Box className="flex items-center gap-1">
          <TextField
            label="Top K / query"
            type="number"
            size="small"
            value={topKPerQuery}
            onChange={(e) => setTopKPerQuery(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 1000 } }}
            sx={{ width: 120 }}
          />
          <TextField
            label="Min gap (s)"
            type="number"
            size="small"
            value={minGap}
            onChange={(e) => setMinGap(e.target.value)}
            slotProps={{ htmlInput: { min: 0.1, step: 0.1 } }}
            sx={{ width: 110 }}
          />
          <TextField
            label="Max gap (s)"
            type="number"
            size="small"
            value={maxGap}
            onChange={(e) => setMaxGap(e.target.value)}
            slotProps={{ htmlInput: { min: 1 } }}
            sx={{ width: 110 }}
          />
          <TextField
            label="Số sequences"
            type="number"
            size="small"
            value={topSeq}
            onChange={(e) => setTopSeq(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 50 } }}
            sx={{ width: 120 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            disabled={searching}
            onClick={onSearchClick}
            sx={{ backgroundColor: searching ? "#9e9e9e" : "#1976d2", height: 40 }}
          >
            {searching ? "đang tìm..." : "Tìm kiếm"}
          </Button>
        </Box>
      </Box>

      {isOpen && (
        <PopupAlert severity={popupSeverity} message={popupMessage} closeModal={() => setIsOpen(false)} />
      )}
    </Box>
  );
}
