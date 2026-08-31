/**
 * NANCY ENGLISH CENTER - Nhận đăng ký học thử
 * =============================================
 *
 * Script này nhận dữ liệu từ form trên thienuy.edu.vn, ghi vào Google Sheet
 * và gửi email báo về cho trung tâm.
 *
 * CÁCH CÀI (làm một lần, khoảng 10 phút)
 * --------------------------------------
 * KHÔNG cần copy Sheet ID. Script gắn thẳng vào Sheet nên tự tìm thấy nó.
 *
 * 1. Tạo một Google Sheet mới, đặt tên ví dụ "Đăng ký học thử".
 *
 * 2. Ngay trong Sheet đó, vào menu:  Tiện ích mở rộng (Extensions)
 *                                    > Apps Script
 *    Cách này tạo ra một script GẮN LIỀN với Sheet. Đây là điểm mấu chốt:
 *    script sẽ tự biết Sheet của nó là cái nào, không phải dán ID, nên
 *    không thể sai ID được nữa.
 *
 *    LƯU Ý: đừng vào script.google.com để tạo project mới. Làm cách đó
 *    script sẽ đứng rời, không gắn với Sheet nào, và lại phải dán ID.
 *
 * 3. Xoá hết code mẫu, dán toàn bộ file này vào, bấm Save.
 *
 * 4. Bấm Deploy > New deployment > chọn type "Web app":
 *       - Execute as:      Me (thienuy@gmail.com)
 *       - Who has access:  Anyone            <-- BẮT BUỘC chọn Anyone,
 *                                                nếu để "Anyone with Google
 *                                                account" thì form sẽ lỗi.
 *    Bấm Deploy, chấp nhận cấp quyền.
 *
 * 5. Copy Web app URL (dạng https://script.google.com/macros/s/..../exec)
 *    và dán vào index.html, thuộc tính data-endpoint của thẻ <form>:
 *
 *       <form class="reg-form" data-reg-form data-endpoint="DÁN_URL_VÀO_ĐÂY" novalidate>
 *
 * 6. Xong. Mở trang, điền thử một đăng ký để kiểm tra.
 *
 * LƯU Ý KHI SỬA VỀ SAU
 * --------------------
 * Mỗi lần sửa file này phải Deploy lại (Deploy > Manage deployments >
 * biểu tượng bút chì > Version: New version > Deploy). Nếu chỉ bấm Save
 * thì bản đang chạy vẫn là bản cũ.
 */

// ---------- CẤU HÌNH ----------
// Để trống nếu script được tạo từ trong Sheet (Extensions > Apps Script),
// đây là cách nên dùng. Chỉ điền ID khi script đứng rời khỏi Sheet.
const SHEET_ID = "";
const NOTIFY_EMAIL = "thienuy@gmail.com";
const TIMEZONE = "Asia/Ho_Chi_Minh";

const HEADERS = [
  "Thời gian",
  "Phụ huynh",
  "Tên con",
  "Điện thoại",
  "Lớp",
  "Ghi chú",
];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // Bẫy spam: trường "website" được ẩn khỏi người dùng thật, chỉ bot mới
    // điền vào. Trả về ok để bot không biết là đã bị chặn.
    if (p.website) {
      return jsonOutput({ ok: true });
    }

    if (!p.name || !p.phone) {
      return jsonOutput({ ok: false, error: "Thiếu tên hoặc số điện thoại." });
    }

    const sheet = getSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const now = Utilities.formatDate(new Date(), TIMEZONE, "dd/MM/yyyy HH:mm");

    sheet.appendRow([
      now,
      p.name,
      p.child || "",
      // Dấu nháy đơn ở đầu giữ số 0 của số điện thoại. Không có nó,
      // Sheets đọc "0938471206" thành số và nuốt mất số 0 đầu.
      "'" + p.phone,
      p.grade || "",
      p.note || "",
    ]);

    sendNotification(p, now);

    return jsonOutput({ ok: true });
  } catch (err) {
    // Ghi log để xem lại trong Executions của Apps Script
    console.error(err);
    return jsonOutput({ ok: false, error: String(err) });
  }
}

/**
 * Lấy sheet để ghi dữ liệu.
 *
 * Ưu tiên Sheet mà script được gắn vào. Nhờ vậy trường hợp thường gặp
 * không cần ID nào cả, và cũng không thể dán nhầm ID được.
 */
function getSheet() {
  const bound = SpreadsheetApp.getActiveSpreadsheet();

  if (bound) {
    return bound.getSheets()[0];
  }

  if (!SHEET_ID) {
    throw new Error(
      "Script không gắn với Sheet nào và SHEET_ID đang để trống. " +
        "Hãy mở Sheet rồi vào Tiện ích mở rộng > Apps Script để tạo lại.",
    );
  }

  return SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
}

function sendNotification(p, now) {
  const lines = [
    "Có đăng ký học thử mới từ thienuy.edu.vn",
    "",
    "Phụ huynh: " + p.name,
    "Tên con:   " + (p.child || "(không điền)"),
    "Điện thoại: " + p.phone,
    "Lớp:       " + (p.grade || "(không điền)"),
    "Ghi chú:   " + (p.note || "(không có)"),
    "",
    "Thời gian: " + now,
  ];

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Đăng ký học thử: " + p.name + " - " + p.phone,
      body: lines.join("\n"),
    });
  } catch (err) {
    // Email lỗi thì vẫn coi như đăng ký thành công, vì dữ liệu đã nằm
    // an toàn trong Sheet rồi. Chỉ ghi log lại.
    console.error("Không gửi được email: " + err);
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Chạy hàm này một lần trong trình soạn thảo Apps Script (chọn hàm rồi bấm
 * Run) để kiểm tra kết nối tới Sheet và quyền gửi mail, trước khi deploy.
 */
function testSetup() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  console.log("Kết nối Sheet OK: " + sheet.getParent().getName());

  doPost({
    parameter: {
      name: "Kiểm tra hệ thống",
      child: "Kiểm tra",
      phone: "0866169569",
      grade: "Lớp 4",
      note: "Dòng thử, có thể xoá.",
    },
  });

  console.log("Đã ghi thử một dòng và gửi email. Kiểm tra Sheet và hộp thư.");
}
