"use client"
import React, { useState } from "react";
import JSZip from "jszip";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
} from "@mui/material";

type FileContent = {
  name: string;   // tên hiển thị (không có đuôi)
  content: string;
  order: number;  // số thứ tự để sort
};

const ZipReader: React.FC = () => {
  const [files, setFiles] = useState<FileContent[]>([]);
  const [zipInfo, setZipInfo] = useState<{ part: number; group: string } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 👉 chỗ thêm logic parse tên file zip
    const zipName = file.name.replace(/\.zip$/, "");
    const zipMatch = zipName.match(/query-p(\d+)-(.+)/);
    if (zipMatch) {
        setZipInfo({ part: parseInt(zipMatch[1], 10), group: zipMatch[2] });
    }

    const zip = await JSZip.loadAsync(file);
    const fileContents: FileContent[] = [];

    for (const [fileName, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async("string");

        // Bỏ phần đuôi file (.txt, .csv, .json...)
        const displayName = fileName.replace(/\.[^/.]+$/, "");

        // Tìm số thứ tự (vd: query-p2-29-qa => 29)
        const match = displayName.match(/query-p\d+-(\d+)-/);
        const order = match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;

        fileContents.push({ name: displayName, content, order });
      }
    }

    // Sort theo order tăng dần
    fileContents.sort((a, b) => a.order - b.order);

    setFiles(fileContents);
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        ZIP File Reader
      </Typography>

      <Button variant="contained" component="label">
        Upload ZIP
        <input
          type="file"
          accept=".zip"
          hidden
          onChange={handleFileChange}
        />
      </Button>

      {files.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 3, marginBottom: 5 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>File</strong></TableCell>
                <TableCell><strong>Content</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((f, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: "bold", width: "200px" }}>
                    {f.name}
                  </TableCell>
                  <TableCell>
                    <pre
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: "300px",
                        overflow: "auto",
                        margin: 0,
                      }}
                    >
                      {f.content}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ZipReader;
