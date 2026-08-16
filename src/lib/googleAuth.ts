import fs from "fs";
import path from "path";
import { google } from "googleapis";

// Load credentials Google tại runtime (không import tĩnh để thiếu file không phá build).
// Thứ tự ưu tiên:
//   1. Env GOOGLE_SERVICE_ACCOUNT_KEY (chuỗi JSON key đầy đủ)
//   2. File service-account.json ở root project
export function getServiceAccount(): { client_email: string; private_key: string } {
  const envKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    const cred = JSON.parse(envKey);
    return {
      client_email: cred.client_email,
      private_key: String(cred.private_key).replace(/\\n/g, "\n"),
    };
  }

  const file = path.join(process.cwd(), "service-account.json");
  if (fs.existsSync(file)) {
    const cred = JSON.parse(fs.readFileSync(file, "utf8"));
    if (cred.client_email && cred.private_key) {
      return { client_email: cred.client_email, private_key: cred.private_key };
    }
    throw new Error(
      "service-account.json tồn tại nhưng thiếu client_email/private_key — dán key thật vào file hoặc set env GOOGLE_SERVICE_ACCOUNT_KEY"
    );
  }

  throw new Error(
    "Thiếu credentials Google: đặt service-account.json ở root project hoặc set env GOOGLE_SERVICE_ACCOUNT_KEY (chuỗi JSON key)"
  );
}

export function getSheetsAuth() {
  const sa = getServiceAccount();
  return new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}
