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

  function renderViewer(course, selectedIndex) {
    var item = course.items[selectedIndex];
    var alt = escapeHtml(altText(course));
    var caption = item.caption
      ? '<p class="results-detail__cap">' +
        escapeHtml(item.caption) +
        " <em>" +
        escapeHtml(item.meta) +
        "</em></p>"
      : "";
    var thumbs = course.items
      .map(function (thumb, index) {
        var current = index === selectedIndex ? ' aria-current="true"' : "";

        return (
          '<button class="results-thumb" type="button" data-action="select" data-index="' +
          index +
          '" aria-label="Xem phiếu điểm ' +
          (index + 1) +
          " / " +
          course.items.length +
          '"' +
          current +
          '><img src="' +
          escapeHtml(thumb.src) +
          '" alt="" loading="lazy" decoding="async" /></button>'
        );
      })
      .join("");

    return (
      '<div class="results-viewer" data-shape="' +
      escapeHtml(course.shape) +
      '"><div class="results-main">' +
      '<div class="results-detail__stage">' +
      '<button class="results-nav" type="button" data-action="prev" aria-label="Phiếu điểm trước">&#8249;</button>' +
      '<div class="results-main__document"><img class="results-main__image" src="' +
      escapeHtml(item.src) +
      '" alt="' +
      alt +
      '" decoding="async" />' +
      caption +
      '<p class="results-detail__count">' +
      (selectedIndex + 1) +
      " / " +
      course.items.length +
      "</p></div>" +
      '<button class="results-nav" type="button" data-action="next" aria-label="Phiếu điểm tiếp theo">&#8250;</button>' +
      '</div></div><div class="results-thumbs" role="group" aria-label="Danh sách phiếu điểm">' +
      thumbs +
      "</div></div>"
    );
  }

  function createResultsModal(root, data) {
    var current = null;
    var selectedIndex = -1;
    var lastTrigger = null;

    function paint() {
      if (!current) return;
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
        renderViewer(current, selectedIndex) +
        "</div>";
    }

    function open(key, trigger) {
      var course = data[key];
      if (!course || !course.items || !course.items.length) return;

      current = course;
      selectedIndex = 0;
      lastTrigger = trigger || null;
      paint();
      root.setAttribute("aria-hidden", "false");
      root.setAttribute("aria-label", "Thành tích học viên " + course.label);
      root.classList.add("open");
      document.body.classList.add("lightbox-active");
    }

    function close() {
      current = null;
      selectedIndex = -1;
      root.innerHTML = "";
      root.setAttribute("aria-hidden", "true");
      root.classList.remove("open");
      document.body.classList.remove("lightbox-active");

      if (lastTrigger) lastTrigger.focus();
      lastTrigger = null;
    }

    function step(offset) {
      var count = current.items.length;
      selectedIndex = (selectedIndex + offset + count) % count;
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
      else if (action === "select") {
        var nextIndex = parseInt(trigger.getAttribute("data-index"), 10);
        if (nextIndex >= 0 && nextIndex < current.items.length) {
          selectedIndex = nextIndex;
          paint();
        }
      } else if (action === "next") step(1);
      else if (action === "prev") step(-1);
    });

    document.addEventListener("keydown", function (event) {
      if (!current) return;
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
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
    renderViewer: renderViewer,
    createResultsModal: createResultsModal,
  };
})();
