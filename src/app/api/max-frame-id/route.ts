import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { fps } from "@/constants/fps";  

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  // Ví dụ: L24_V035 → group = "L24"
  const group = videoId.split("_")[0];
  const folderPath = path.join(process.cwd(), "public", "assets", group, videoId);

  if (!fs.existsSync(folderPath)) {
    return NextResponse.json({ error: "Folder not found", folderPath }, { status: 404 });
  }

  const files = fs.readdirSync(folderPath);

  let maxFile: string | null = null;
let maxTs = -1;

for (const file of files) {
  const match = file.match(/_(\d+\.\d+)s/);
  if (match) {
    const ts = parseFloat(match[1]);
    if (ts > maxTs) {
      maxTs = ts;
      maxFile = file;
    }
  }
}

// lấy fps từ videoId
const fpsVal = fps[`${videoId}.mp4`] ?? fps[videoId] ?? 1;
// convert timestamp -> frameId
const maxFrameId = Math.floor(maxTs * fpsVal);

return NextResponse.json({ 
  file: maxFile, 
  timestamp: maxTs, 
  fps: fpsVal, 
  maxFrameId 
});
}
