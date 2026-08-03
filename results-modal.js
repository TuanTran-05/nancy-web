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

  function createResultsModal(root, data) {
    var current = null;
    var detailIndex = -1;
    var lastTrigger = null;

    function paint() {
      if (!current) return;

      if (detailIndex >= 0) {
        root.innerHTML = renderDetail(current, detailIndex);
        return;
      }

      root.innerHTML =
        '<div class="results-panel">' +
        '<div class="results-head">' +
        '<span class="results-badge">' +
        escapeHtml(current.cefr || current.grade) +
        "</span>" +
        "<div><h3>Thành tích học viên " +
        escapeHtml(current.label) +
        "</h3><p>" +
        escapeHtml(current.org) +
        " · " +
        escapeHtml(current.grade) +
        "</p></div>" +
        '<button class="results-close" type="button" data-action="close" aria-label="Đóng">&#10005;</button>' +
        "</div>" +
        renderStats(current) +
        renderGrid(current) +
        "</div>";
    }

    function open(key, trigger) {
      var course = data[key];
      if (!course) return;

      current = course;
      detailIndex = -1;
      lastTrigger = trigger || null;
      paint();
      root.setAttribute("aria-hidden", "false");
      root.setAttribute("aria-label", "Thành tích học viên " + course.label);
      root.classList.add("open");
      document.body.classList.add("lightbox-active");
    }

    function close() {
      current = null;
      detailIndex = -1;
      root.innerHTML = "";
      root.setAttribute("aria-hidden", "true");
      root.classList.remove("open");
      document.body.classList.remove("lightbox-active");

      if (lastTrigger) lastTrigger.focus();
      lastTrigger = null;
    }

    function step(offset) {
      var count = current.items.length;
      detailIndex = (detailIndex + offset + count) % count;
      paint();
    }

    root.addEventListener("click", function (event) {
      // Bấm thẳng vào nền tối thì đóng. Bấm vào nội dung bên trong thì không.
      if (event.target === root) {
        close();
        return;
      }

      var trigger = event.target.closest("[data-action]");
      if (!trigger || !current) return;

      var action = trigger.getAttribute("data-action");

      if (action === "close") close();
      else if (action === "grid") {
        detailIndex = -1;
        paint();
      } else if (action === "zoom") {
        detailIndex = parseInt(trigger.getAttribute("data-index"), 10);
        paint();
      } else if (action === "next") step(1);
      else if (action === "prev") step(-1);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !current) return;

      // Từ ảnh phóng to, Escape lùi về lưới trước đã. Người xem đang ở hai
      // lớp sâu, đóng thẳng cả hộp thoại là mất chỗ đang xem.
      if (detailIndex >= 0) {
        detailIndex = -1;
        paint();
        return;
      }

      close();
    });

    root.setAttribute("aria-hidden", "true");

    return {
      open: open,
      close: close,
      isOpen: function () {
        return current !== null;
      },
    };
  }

  return {
    escapeHtml: escapeHtml,
    renderStats: renderStats,
    renderGrid: renderGrid,
    renderDetail: renderDetail,
    createResultsModal: createResultsModal,
  };
})();
