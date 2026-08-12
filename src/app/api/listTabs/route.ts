import { NextResponse } from "next/server";
import { google } from "googleapis";
import serviceAccount from "../../../../service-account.json";

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    await auth.authorize();
    const sheets = google.sheets({ version: "v4", auth });

    // Lấy metadata: danh sách các sheet
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetList = spreadsheet.data.sheets ?? [];

    const titles = sheetList
      .map((s) => s.properties?.title)
      .filter((t): t is string => !!t);

    // Gọi batchGet cho tất cả sheetName cùng lúc
    const resp = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: titles.map((t) => `${t}!1:1`),
    });

    // Map lại theo thứ tự titles
    const results = titles.map((title, idx) => ({
      sheetName: title,
      firstRow: resp.data.valueRanges?.[idx]?.values?.[0] ?? [],
    }));

    return NextResponse.json({ success: true, tabs: results });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
