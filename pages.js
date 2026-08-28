(function () {
  "use strict";

  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var targetSelector = group.getAttribute("data-filter-group");
    var unit = group.getAttribute("data-filter-unit") || "mục";
    var items = document.querySelectorAll(targetSelector);
    var buttons = group.querySelectorAll("[data-filter-value]");
    var status = document.querySelector("[data-filter-status]");

    if (!items.length || !buttons.length) return;

    var applyFilter = function (value) {
      var visibleCount = 0;

      items.forEach(function (item) {
        var categories = (item.getAttribute("data-filter-item") || "").split(" ");
        var visible = value === "all" || categories.includes(value);
        item.hidden = !visible;
        if (visible) visibleCount += 1;
      });

      buttons.forEach(function (button) {
        button.setAttribute(
          "aria-pressed",
          String(button.getAttribute("data-filter-value") === value),
        );
      });

      if (status) {
        status.textContent = "Đang hiển thị " + visibleCount + " " + unit + ".";
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        applyFilter(button.getAttribute("data-filter-value") || "all");
      });
    });
  });
})();
