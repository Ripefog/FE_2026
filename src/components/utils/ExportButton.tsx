"use client";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  Box,
  Chip
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface ExportButtonProps {
  rows: any[];
  queryName: string;
  mode: "qa" | "trake" | null;
  eventCount: number;
}

export default function ExportButton({ rows, queryName, mode, eventCount }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"loading" | "success" | "confirm" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [pendingData, setPendingData] = useState<any>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);

  const exportToSheet = async (replace = false) => {
  if (!rows || rows.length === 0) {
    setOpen(true);
    setStatus("error");
    setMessage("Không có dữ liệu để export!");
    return;
  }

  setOpen(true);
  setStatus("loading");
  setMessage("Đang export dữ liệu...");

  try {
    const res = await fetch("/api/export", {
      method: "POST",
      body: JSON.stringify({ rows, queryName, mode, eventCount, forceReplace: replace }),
    });
    const json = await res.json();

    if (json.needConfirm) {
      setStatus("confirm");
      setMessage(json.message);
      setSheetName(json.sheetName); 
      setPendingData({ rows, queryName, mode, eventCount });
    } else if (json.success) {
      setStatus("success");
      setMessage("Xuất dữ liệu thành công!");
      setTimeout(() => setOpen(false), 1500);
      window.open(json.url, "_blank");
    } else {
      setStatus("error");
      setMessage("Lỗi: " + json.error);
    }
  } catch (err: any) {
    setStatus("error");
    setMessage("Lỗi kết nối đến server: " + err.message);
  }
};


  const handleReplace = async () => {
    if (!pendingData) return;
    await exportToSheet(true);
    setPendingData(null);
  };

  return (
    <>
      <Button
        variant="contained"
        color="success"
        onClick={() => exportToSheet()}
      >
        Export to Google Sheet
      </Button>

      <Dialog
        open={open}
        onClose={(event, reason) => {
            // chỉ chặn đóng khi đang loading hoặc confirm
            if ((status === "loading" || status === "confirm") &&
                (reason === "backdropClick" || reason === "escapeKeyDown")) {
            return;
            }
            setOpen(false);
        }}
    >

        <DialogTitle>Export to Google Sheet</DialogTitle>
        <DialogContent sx={{ textAlign: "center", p: 3 }}>
            {status === "loading" && (
                <>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>{message}</Typography>
                </>
            )}
            {status === "success" && (
                <>
                    <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                    <Typography sx={{ mt: 2 }}>{message}</Typography>
                </>
            )}

            {status === "confirm" && (
                <Box sx={{ textAlign: "center" }}>
                    <Typography>
                        Sheet{" "}
                        
                        <Chip
                            label={sheetName}
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: "bold", fontSize: "1rem", px: 2 }}
                        />
                        
                        {" "}đã tồn tại
                    </Typography>
                    <Typography>{message}</Typography>
                </Box>
            )}


            {status === "error" && <Typography color="error">{message}</Typography>}
        </DialogContent>

        {status === "confirm" && (
            <DialogActions>
            <Button onClick={() => setOpen(false)}>Hủy</Button>
            <Button onClick={handleReplace} color="error">
                Replace
            </Button>
            </DialogActions>
        )}
        </Dialog>

    </>
  );
}
