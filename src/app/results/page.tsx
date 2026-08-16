"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box,
  Chip,
  Button,
  TextField,
  IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";


interface TabInfo {
  sheetName: string;
  firstRow: string[];
}

export default function TabListTable() {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const [busy, setBusy] = useState<string | null>(null); // tên tab đang xử lý

  async function fetchTabs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/listTabs", { method: "GET" });
      const text = await res.text();

      try {
        const data = JSON.parse(text);
        if (data.success) {
          setTabs(data.tabs);
        } else {
          setError(data.error || "Có lỗi xảy ra");
        }
      } catch {
        console.error("❌ Response không phải JSON:", text);
        setError("API trả về HTML thay vì JSON");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTabs();
  }, []);

  // Xóa tab theo tên (có confirm)
  async function handleDeleteTab(title: string) {
    if (!window.confirm(`Xóa tab "${title}"? Không thể hoàn tác.`)) return;
    setBusy(title);
    try {
      const res = await fetch(`/api/sheetTabs?title=${encodeURIComponent(title)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        alert(`❌ ${data.error}`);
        return;
      }
      await fetchTabs();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusy(null);
    }
  }

  // Tạo tab mới (trống)
  async function handleCreateTab() {
    const title = newTabName.trim();
    if (!title) return;
    setBusy("__create__");
    try {
      const res = await fetch("/api/sheetTabs", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!data.success) {
        alert(`❌ ${data.error}`);
        return;
      }
      setNewTabName("");
      await fetchTabs();
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  // tìm số cột lớn nhất
  const maxCols = Math.max(0, ...tabs.map((t) => t.firstRow.length));
    // chỉ sort theo field thứ 3
const processedTabs = [...tabs].sort((a, b) => {
  const getIndex = (name: string) => {
    const parts = name.split("-");
    // ví dụ: ["query", "p2", "21", "qa"]
    return parts.length >= 3 ? parseInt(parts[2], 10) : NaN;
  };

  const numA = getIndex(a.sheetName);
  const numB = getIndex(b.sheetName);

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  // fallback: nếu không parse được số thì sort theo tên gốc
  return a.sheetName.localeCompare(b.sheetName, "vi", { numeric: true });
});




  const sheetNames = tabs.map(t => t.sheetName);

  // Lấy số thứ tự từ sheetName bằng split
  const indices = sheetNames
    .map(name => {
      const parts = name.split("-");
      // "query", "p2", "<số>", "kis"
      return parts.length >= 3 ? parseInt(parts[2], 10) : null;
    })
    .filter((n): n is number => n !== null && !isNaN(n))
    .sort((a, b) => a - b);

  // indices đã là danh sách số thực có trong sheetNames
  const missingNumbers: number[] = [];
  if (indices.length > 0) {
    const min = indices[0];
    const max = 35

    for (let i = min; i <= max; i++) {
      if (!indices.includes(i)) {
        missingNumbers.push(i);
      }
    }
  }

// Muốn render ra tên sheet dạng chuẩn thì thêm hậu tố tùy ý
const missingSheetNames = missingNumbers.map(i => `query-${i}`);
    
  return (
    <Paper sx={{ width: "100%", overflowX: "auto", p: 2 }}>
      {missingSheetNames.length > 0 && (
      <>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ mt: 4, mb: 2, fontWeight: "bold", color: "orange" }}>Còn thiếu {missingSheetNames.length} query</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {missingSheetNames.map((val, idx) => (
                    <Chip
                      key={idx}
                      label={val.replace(/-kis$/, "")}
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    )}
      <Typography
        variant="h6"
        component="div"
        sx={{ mb: 2, fontWeight: "bold" }}
      >
        Danh sách Tabs trong Google Sheet
      </Typography>

      {/* Tạo tab mới + làm mới */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="Tên tab mới (vd: query-p4-1-kis)"
          value={newTabName}
          onChange={(e) => setNewTabName(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          onKeyDown={(e) => e.key === "Enter" && handleCreateTab()}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTab}
          disabled={busy === "__create__" || !newTabName.trim()}
        >
          Tạo tab
        </Button>
        <Button variant="outlined" onClick={fetchTabs} disabled={loading}>
          Làm mới
        </Button>
      </Box>
{/*
      <SubmissionButton/> */}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Tên Tab</TableCell>
            {Array.from({ length: maxCols }).map((_, colIdx) => (
              <TableCell key={colIdx} sx={{ fontWeight: "bold" }}>
                Cột {colIdx + 1}
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: "bold" }}>Xóa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processedTabs.map((tab, idx) => (
            <TableRow key={idx}>
              <TableCell>{tab.sheetName}</TableCell>
              {Array.from({ length: maxCols }).map((_, colIdx) => (
                <TableCell key={colIdx}>{tab.firstRow[colIdx] || ""}</TableCell>
              ))}
              <TableCell>
                <IconButton
                  size="small"
                  color="error"
                  disabled={busy === tab.sheetName}
                  onClick={() => handleDeleteTab(tab.sheetName)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}

        </TableBody>
      </Table>


    </Paper>
  );
}
