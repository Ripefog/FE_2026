import { NextResponse } from "next/server";
import { google } from "googleapis";
import serviceAccount from "../../../../service-account.json";

export async function POST(req: Request) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEET_ID");

    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.authorize();
    const body = await req.json();
    const { rows, queryName, mode, eventCount, forceReplace } = body;

    const sheets = google.sheets({ version: "v4", auth });

    // check sheet tồn tại
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === queryName
    );

    let targetSheetId: number | undefined;

    if (existingSheet && !forceReplace) {
        return NextResponse.json({
            success: false,
            needConfirm: true,
            sheetName: queryName,
            message: `Xác nhận replace?`,
        });
    }

    if (existingSheet) {
      targetSheetId = existingSheet.properties?.sheetId;
    } else {
      const addResp = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: queryName } } }],
        },
      });
      targetSheetId =
        addResp.data.replies?.[0].addSheet?.properties?.sheetId ?? 0;
    }

    // build values
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

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${queryName}!A1`,
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return NextResponse.json({
      success: true,
      replaced: !!existingSheet,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=${targetSheetId}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

