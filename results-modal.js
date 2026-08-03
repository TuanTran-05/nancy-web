// Hộp thoại thành tích học viên.
//
// Tách làm hai lớp: các hàm renderX dựng chuỗi HTML thuần, không chạm DOM,
// nên kiểm thử được trực tiếp. createResultsModal chỉ lo gắn chuỗi vào DOM
// và uỷ nhiệm sự kiện. Nhờ tách vậy, phần logic hiển thị không cần DOM giả
// để test.
window.NancyResults = (function () {
  "use strict";

  var ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  // Nhãn điểm đến từ tệp dữ liệu do người viết, không phải từ người dùng,
  // nhưng chúng vẫn đi thẳng vào innerHTML nên vẫn phải thoát ký tự.
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, function (char) {
      return ESCAPES[char];
    });
  }

  function statCell(value, label) {
    if (!value && value !== 0) return "";
    return (
      '<div class="results-stat"><b>' +
      escapeHtml(value) +
      "</b><span>" +
      escapeHtml(label) +
      "</span></div>"
    );
  }

  function renderStats(course) {
    return (
      '<div class="results-stats">' +
      statCell(course.stats.total, "học viên") +
      statCell(course.stats.highest, "Điểm cao nhất") +
      statCell(course.stats.range, "Trình độ đạt") +
      "</div>"
    );
  }

  function altText(course) {
    return "Phiếu điểm " + course.label + " của học viên Nancy English Center";
  }

  function renderGrid(course) {
    var alt = escapeHtml(altText(course));
    var tiles = course.items
      .map(function (item, index) {
        var caption = item.caption
          ? '<span class="results-tile__cap">' +
            escapeHtml(item.caption) +
            "<em>" +
            escapeHtml(item.meta) +
            "</em></span>"
          : "";

        return (
          '<button class="results-tile" type="button" data-action="zoom" data-index="' +
          index +
          '"><img src="' +
          escapeHtml(item.src) +
          '" alt="' +
          alt +
          '" loading="lazy" decoding="async" />' +
          caption +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="results-grid" data-shape="' +
      escapeHtml(course.shape) +
      '">' +
      tiles +
      "</div>"
    );
  }

  function renderDetail(course, index) {
    var item = course.items[index];
    var caption = item.caption
      ? '<p class="results-detail__cap">' +
        escapeHtml(item.caption) +
        " <em>" +
        escapeHtml(item.meta) +
        "</em></p>"
      : "";

    return (
      '<div class="results-detail">' +
      '<button class="results-detail__back" type="button" data-action="grid">Về lưới kết quả</button>' +
      '<div class="results-detail__stage">' +
      '<button class="results-nav" type="button" data-action="prev" aria-label="Phiếu điểm trước">&#8249;</button>' +
      '<img src="' +
      escapeHtml(item.src) +
      '" alt="' +
      escapeHtml(altText(course)) +
      '" decoding="async" />' +
      '<button class="results-nav" type="button" data-action="next" aria-label="Phiếu điểm tiếp theo">&#8250;</button>' +
      "</div>" +
      caption +
      '<p class="results-detail__count">' +
      (index + 1) +
      " / " +
      course.items.length +
      "</p>" +
      "</div>"
    );
  }

  return {
    escapeHtml: escapeHtml,
    renderStats: renderStats,
    renderGrid: renderGrid,
    renderDetail: renderDetail,
  };
})();
