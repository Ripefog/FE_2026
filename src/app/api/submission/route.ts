import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { google } from "googleapis";
import archiver from "archiver";
import serviceAccount from "../../../../service-account.json";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID as string;

export async function GET() {
  try {
    if (!SPREADSHEET_ID) throw new Error("Missing GOOGLE_SHEET_ID");

    // Auth Google Sheets API
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    await auth.authorize();
    const sheets = google.sheets({ version: "v4", auth });

    // Lấy danh sách tab
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    const sheetList = spreadsheet.data.sheets ?? [];

    // 📂 Thư mục submission (lưu CSV)
    const submissionDir = path.join(process.cwd(), "submission");
    if (!fs.existsSync(submissionDir)) fs.mkdirSync(submissionDir);

    for (const s of sheetList) {
      const title = s.properties?.title;
      if (!title) continue;

      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: title,
      });

      const values = resp.data.values || [];
      const csv = values.map((row) => row.join(",")).join("\n");

      const filePath = path.join(submissionDir, `${title}.csv`);
      fs.writeFileSync(filePath, csv, "utf8");
    }

    // 📦 Tạo file ZIP trong public/
    const zipPath = path.join(process.cwd(), "public", "submission.zip");
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(submissionDir, false);
    await archive.finalize();

    return NextResponse.json({
      message: "Export thành công",
      downloadUrl: "/submission.zip", // FE sẽ tải file này
    });
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
