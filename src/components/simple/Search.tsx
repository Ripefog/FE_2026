"use client";

import { Box, Button, TextField, Typography, Slider } from "@mui/material";
import * as React from "react";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import {
  useSearchContext,
  useSearchResultContext,
} from "@/contexts/searchContext";
import { useState, useEffect } from "react";
import PopupAlert from "../utils/Popup";
import CustomAvatar from "../utils/CustomAvatar";
import { yellow } from "@mui/material/colors";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";

import ResultModal from "../utils/SubmitTable";

import { useFetchIgnoredImages } from "@/hooks/getIgnoreInit";

export default function Search() {
  const {
    query,
    setQuery,
    mode,
    setMode,
    queryName,
    setQueryName,
    dataSource,
    setDataSource,
    topK,
    setTopK,
    numQuery,
    setNumQuery,
  } = useSearchContext();
  const { results, searching, handleSearch, cols, setCols } =
    useSearchResultContext();

  const [isOpen, setIsOpen] = useState(false);
  const [popupSeverity, setPopupSeverity] = useState<
    "success" | "info" | "warning" | "error"
  >("info");
  const [popupMessage, setPopupMessage] = useState("");
  const closeModal = () => {
    setIsOpen(false);
  };

  // Gọi hàm này khi cần load ignore ban đầu cho 1 query_name
  const { fetchIgnoredImages } = useFetchIgnoredImages();
  const onSearchClick = () => {
    if (query.trim() === "") {
      setPopupSeverity("warning");
      setPopupMessage("Cần nhập câu truy vấn trước");
      setIsOpen(true);
      return;
    }

    if (queryName.trim() === "") {
      setPopupSeverity("warning");
      setPopupMessage("Chọn query name trước");
      setIsOpen(true);
      return;
    }

    handleSearch({
      text_query: query,
      mode: mode,
      object_filters: {},
      color_filters: [],
      ocr_query: "",
      asr_query: "",
      top_k: topK,
      user_query: dataSource,
      num_query: numQuery,
    });

    setCols(3);
    fetchIgnoredImages(queryName);
  };

  const [username, setUsername] = useState<string>("Unknown User");
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleChangeDataSource = (event: SelectChangeEvent) => {
    setDataSource(event.target.value as string);
  };

  const QUERYNAME = Array.from({ length: 25 }, (_, i) => ({
    value: `Q${i + 1}`,
    label: `Q${i + 1}`,
  }));

  const isDifferent = dataSource !== username;

  const [submit, setSubmit] = useState(false);
  const closeSubmitModal = () => {
    setSubmit(false);
  };
  const openSubmitModal = () => {
    if (results.length === 0) {
      setPopupSeverity("warning");
      setPopupMessage("Result rỗng. Cần nhấn 'Tìm kiếm' trước!");
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
  const [tempNumQuery, setTempNumQuery] = useState("1"); // hiển thị input
  useEffect(() => {
    if (tempNumQuery === "") return; // khi đang xóa, chưa update

    const parsed = parseInt(tempNumQuery, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      setNumQuery(parsed);
    }
  }, [tempNumQuery]);

  return (
    <Box className="w-full h-full p-2 border border-solid border-black">
      <Box className="flex flex-col justify-center items-center">
        <Box className="w-full p-2 flex justify-center items-center gap-5">
          <TextField
            id="filled-basic"
            label="Nhập query"
            variant="filled"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            fullWidth
          />

          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel
                id="demo-simple-select-label"
                sx={{
                  fontSize: 12,
                  "&.MuiInputLabel-shrink": {
                    transform: "translate(14px, -6px) scale(0.85)", // đẩy label lên cao hơn
                    backgroundColor: "white", // nếu muốn nền che border
                    padding: "0 4px",
                  },
                }}
              >
                Data source?
              </InputLabel>

              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={dataSource}
                label="Age"
                onChange={handleChangeDataSource}
                sx={{
                  border: isDifferent ? "2px solid red" : undefined,
                  backgroundColor: isDifferent ? "#ffebee" : "white", // đỏ nhạt cảnh báo
                }}
              >
                <MenuItem value={"Duy Khương"}>Khương</MenuItem>
                <MenuItem value={"Văn Huấn"}>Huấn</MenuItem>
                <MenuItem value={"Minh Trí"}>Trí</MenuItem>
                <MenuItem value={"Ngọc Minh"}>Minh</MenuItem>
                <MenuItem value={"Văn Nam"}>Nam</MenuItem>
                <MenuItem value={""}>Full database</MenuItem>
                {/* <MenuItem value={"all"}>Full database</MenuItem> */}
              </Select>
            </FormControl>
          </Box>

          <Box className="flex flex-col">
            <Typography gutterBottom className="text-center">
              Top K: {topK}
            </Typography>
            <Slider
              value={topK}
              onChange={(e, val) => setTopK(val)}
              valueLabelDisplay="auto"
              step={100}
              min={100}
              max={2000}
              sx={{ width: 200 }} // chỉnh độ dài thanh
            />
          </Box>

          <CustomAvatar />
        </Box>

        <Box className="flex-1 w-full mt-2 flex justify-around items-center">
          <Box sx={{ minWidth: 110 }}>
            <FormControl fullWidth>
              <InputLabel
                id="demo-simple-select-label"
                sx={{
                  fontSize: 12,
                  "&.MuiInputLabel-shrink": {
                    transform: "translate(14px, -6px) scale(0.85)", // đẩy label lên cao hơn
                    backgroundColor: "white", // nếu muốn nền che border
                    padding: "0 4px",
                  },
                }}
              >
                Query name
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={queryName}
                label="Age"
                onChange={(e) => setQueryName(e.target.value)}
                sx={{
                  backgroundColor: yellow[100],
                }}
              >
                {QUERYNAME.map((q) => (
                  <MenuItem key={q.value} value={q.value}>
                    {q.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* chọn mode */}
          <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
            >
              <FormControlLabel value="metaclip2" control={<Radio />} label="MetaCLIP2" />
              <FormControlLabel
                value="beit3"
                control={<Radio />}
                label="BEIT3"
              />
              <FormControlLabel
                value="hybrid"
                control={<Radio />}
                label="Hybrid"
              />
            </RadioGroup>
          </FormControl>

          {/* Gửi query */}
          <Box className="flex justify-around items-center gap-2">
            <TextField
              label="Số cột"
              type="number"
              size="small"
              value={cols}
              onChange={(e) => {
                const val = e.target.value;
                setCols(val === "" ? "" : Number(val));
              }}
              slotProps={{
                htmlInput: { min: 1 },
              }}
              sx={{ width: 100 }} // 👈 ép nhỏ hơn
            />

            <TextField
              label="NumQuery"
              type="number"
              value={tempNumQuery}
              onChange={(e) => {
                const val = e.target.value;

                // Cho phép nhập rỗng
                setTempNumQuery(val);

                // Nếu val rỗng thì chưa update numQuery
                if (val === "") return;

                const parsed = parseInt(val, 10);
                if (!isNaN(parsed) && parsed >= 1) {
                  setNumQuery(parsed);
                }
              }}
              onBlur={() => {
                // Khi blur, nếu người dùng bỏ trống hoặc <1 thì reset về 1
                if (tempNumQuery === "" || parseInt(tempNumQuery, 10) < 1) {
                  setTempNumQuery("1");
                  setNumQuery(1);
                }
              }}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: 1,
              }}
              sx={{
                width: "100px",
              }}
              variant="outlined"
            />

            <Button
              variant="contained"
              onClick={onSearchClick}
              sx={{
                backgroundColor: searching ? "#9e9e9e" : "#1976d2",
              }}
            >
              {searching ? "đang tìm kiếm..." : "Tìm kiếm"}
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
          mode="Search"
        />
      )}
    </Box>
  );
}
