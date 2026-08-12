"use client";

import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";

export default function SubmissionButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submission");
      const data = await res.json();

      if (data.downloadUrl) {
        window.location.href = data.downloadUrl; // tải zip
      } else {
        alert("❌ Không có link tải về");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleExport}
      disabled={loading}
      sx={{ mt: 2 }}
    >
      {loading ? <CircularProgress size={20} /> : "Download submission"}
    </Button>
  );
}
