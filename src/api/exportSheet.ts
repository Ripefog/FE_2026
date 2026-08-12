import { NextResponse } from "next/server";
import { google } from "googleapis";

// load credentials từ biến môi trường (không hardcode)
const credentials = JSON.parse(process.env.NEXT_GOOGLE_SERVICE_ACCOUNT_KEY!);
const spreadsheetId = process.env.NEXT_GOOGLE_SHEET_ID!;


const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key.replace(/\\n/g, "\n"), // 🔑 convert về PEM thật
  scopes: SCOPES,
});




export async function POST(req: Request) {
  const body = await req.json();
  const { rows, queryName, mode, eventCount } = body;

  const sheets = google.sheets({ version: "v4", auth });

  // format dữ liệu theo mode
  let values: any[][] = [];

  if (mode === "qa") {
    values = rows.map((r: any) => [r.video_id, r.frame_id, r.qa_text ?? ""]);
  } else if (mode === "trake") {
    values = rows.map((r: any) => {
      const vals = [r.video_id];
      for (let i = 1; i <= eventCount; i++) {
        vals.push(r[`frame_id_${i}`] ?? "");
      }
      return vals;
    });
  } else {
    values = rows.map((r: any) => [r.video_id, r.frame_id]);
  }

  // ghi vào sheet (ghi đè tab có tên queryName hoặc tạo mới)
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${queryName}!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values,
    },
  });

  return NextResponse.json({ success: true, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0` });
}

