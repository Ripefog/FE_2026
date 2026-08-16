import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getSheetsAuth } from "@/lib/googleAuth";

// Lấy spreadsheet hiện tại + map title -> sheetId
async function getSheetsMap() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

  const auth = getSheetsAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const list = spreadsheet.data.sheets ?? [];
  return {
    spreadsheetId,
    sheets,
    list,
    findByTitle: (title: string) =>
      list.find((s) => s.properties?.title === title),
  };
}

// POST { title } — tạo tab mới (trống)
export async function POST(req: Request) {
  try {
    const { title } = await req.json();
    if (!title?.trim()) throw new Error("Thiếu tên tab");

    const ctx = await getSheetsMap();
    if (ctx.findByTitle(title)) {
      return NextResponse.json(
        { success: false, error: `Tab "${title}" đã tồn tại` },
        { status: 400 }
      );
    }

    await ctx.sheets.spreadsheets.batchUpdate({
      spreadsheetId: ctx.spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: title.trim() } } }],
      },
    });

    return NextResponse.json({ success: true, title: title.trim() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE ?title=... — xóa tab theo tên
export async function DELETE(req: Request) {
  try {
    const title = new URL(req.url).searchParams.get("title");
    if (!title) throw new Error("Thiếu tên tab (query ?title=)");

    const ctx = await getSheetsMap();
    const sheet = ctx.findByTitle(title);
    if (!sheet) {
      return NextResponse.json(
        { success: false, error: `Không tìm thấy tab "${title}"` },
        { status: 404 }
      );
    }

    // Google không cho xóa hết tab — phải giữ lại ít nhất 1
    if (ctx.list.length <= 1) {
      return NextResponse.json(
        { success: false, error: "Không thể xóa tab duy nhất của spreadsheet" },
        { status: 400 }
      );
    }

    const sheetId = sheet.properties?.sheetId;
    if (sheetId === undefined) throw new Error("Không đọc được sheetId của tab");

    await ctx.sheets.spreadsheets.batchUpdate({
      spreadsheetId: ctx.spreadsheetId,
      requestBody: { requests: [{ deleteSheet: { sheetId } }] },
    });

    return NextResponse.json({ success: true, deleted: title });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
