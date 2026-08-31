// Nancy English Center - Interactive JavaScript
(function () {
  "use strict";

  var reduceMotion = function () {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };

  var hasObserver = typeof window.IntersectionObserver === "function";

  // ----------------------------------------------------------
  // 1. Mobile menu toggle
  // ----------------------------------------------------------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    var setNav = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    };

    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("open"));
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setNav(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  // ----------------------------------------------------------
  // 2. Sticky header state
  // A sentinel at the top of the document tells us when the header
  // has left the top of the page. No scroll listener involved.
  // ----------------------------------------------------------
  var header = document.querySelector(".site-header");

  if (header && hasObserver) {
    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;height:1px;width:1px;";
    document.body.prepend(sentinel);

    new IntersectionObserver(
      function (entries) {
        header.classList.toggle("is-stuck", !entries[0].isIntersecting);
      },
      { threshold: 0 },
    ).observe(sentinel);
  }

  // ----------------------------------------------------------
  // 3. Gallery lightbox
  // ----------------------------------------------------------
  var galleryItems = document.querySelectorAll(".gal");
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.querySelector(".lightbox-img");
  var lightboxCaption = document.querySelector(".lightbox-caption");
  var lightboxClose = document.querySelector(".lightbox-close");
  var lastTrigger = null;

  if (lightbox && galleryItems.length > 0) {
    var openLightbox = function (item) {
      var img = item.querySelector("img");
      var cap = item.querySelector("figcaption");

      if (!img) return;

      lastTrigger = item;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "";
      lightboxCaption.textContent = cap ? cap.textContent : "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-active");

      if (lightboxClose) lightboxClose.focus();
    };

    galleryItems.forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item);
      });

      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(item);
        }
      });
    });

    var closeLightbox = function () {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-active");
      lightboxImg.removeAttribute("src");

      if (lastTrigger) lastTrigger.focus();
    };

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (
        e.key === "Tab" &&
        lightbox.classList.contains("open") &&
        lightboxClose
      ) {
        e.preventDefault();
        lightboxClose.focus();
        return;
      }

      if (e.key === "Escape" && lightbox.classList.contains("open")) {
        closeLightbox();
      }
    });
  }

  // ----------------------------------------------------------
  // 4. Scroll reveal
  // Staged entry gives each section a reading order instead of dropping
  // the whole page in at once. IntersectionObserver only, no scroll listener.
  // ----------------------------------------------------------
  var revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    if (reduceMotion() || !hasObserver) {
      revealItems.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );

      revealItems.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  // ----------------------------------------------------------
  // 5. Proof-band count up
  // Motivated: the credibility numbers are the reason this band exists,
  // so they earn the eye. Skipped entirely under reduced motion.
  // ----------------------------------------------------------
  var counters = document.querySelectorAll("[data-count-to]");

  if (counters.length && hasObserver && !reduceMotion()) {
    var runCount = function (el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10);
      var suffix = el.getAttribute("data-count-suffix") || "";

      if (!isFinite(target)) return;

      var duration = 1100;
      var start = null;

      var tick = function (now) {
        if (start === null) start = now;

        var progress = Math.min((now - start) / duration, 1);
        // ease-out cubic, so the number settles instead of stopping dead
        var eased = 1 - Math.pow(1 - progress, 3);

        el.textContent = Math.round(target * eased) + suffix;

        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );

    // Deliberately not zeroed up front: the real figure stays in the DOM
    // until the animation actually starts, so a counter that never scrolls
    // into view still shows its true value instead of "0".
    counters.forEach(function (el) {
      countObserver.observe(el);
    });
  }

  // ----------------------------------------------------------
  // 6. Course carousels
  // Each row gets its own controls, so the page can hold several rows.
  // ----------------------------------------------------------
  var courseCarousels = document.querySelectorAll("[data-course-carousel]");

  courseCarousels.forEach(function (courseCarousel) {
    var courseTrack = courseCarousel.querySelector("[data-course-track]");
    var courseControls = courseCarousel.querySelector(
      "[data-course-controls]",
    );
    var coursePrev = courseCarousel.querySelector("[data-course-prev]");
    var courseNext = courseCarousel.querySelector("[data-course-next]");

    if (!courseTrack || !courseControls || !coursePrev || !courseNext) return;

    var courseCards = courseTrack.querySelectorAll(".course-card");
    var frame = 0;

    var getCourseStep = function () {
      if (courseCards.length > 1) {
        return courseCards[1].offsetLeft - courseCards[0].offsetLeft;
      }

      return courseCards.length
        ? courseCards[0].getBoundingClientRect().width
        : courseTrack.clientWidth;
    };

    var updateCourseControls = function () {
      var maxScroll = Math.max(
        0,
        courseTrack.scrollWidth - courseTrack.clientWidth,
      );
      var canScroll = maxScroll > 1;

      coursePrev.disabled = !canScroll || courseTrack.scrollLeft <= 1;
      courseNext.disabled =
        !canScroll || courseTrack.scrollLeft >= maxScroll - 1;
    };

    // The track's own scroll only toggles button state. Batched through
    // rAF so a fast flick never queues up layout reads per frame.
    var queueUpdate = function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        updateCourseControls();
      });
    };

    var scrollCourseTrack = function (direction) {
      courseTrack.scrollBy({
        left: direction * getCourseStep(),
        behavior: reduceMotion() ? "auto" : "smooth",
      });
    };

    courseControls.hidden = false;
    coursePrev.addEventListener("click", function () {
      scrollCourseTrack(-1);
    });
    courseNext.addEventListener("click", function () {
      scrollCourseTrack(1);
    });
    courseTrack.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    updateCourseControls();
  });

  // ----------------------------------------------------------
  // 7. Trial-lesson registration form
  //
  // The form posts to whatever URL sits in data-endpoint on the <form>.
  // While that attribute is empty the form still validates and still
  // gives the parent a real next step (hotline / Zalo) instead of
  // pretending a submission went through.
  // ----------------------------------------------------------
  // Google Forms names its fields entry.NNNNNN rather than anything readable,
  // so each input carries its own data-entry mapping. Keeping the mapping on
  // the markup means re-pointing the form at a new Google Form is a template
  // change, not a code change.
  function buildGoogleFormBody(form) {
    var body = new FormData();

    form.querySelectorAll("[data-entry]").forEach(function (el) {
      var value = (el.value || "").trim();

      if (value) {
        body.append(el.getAttribute("data-entry"), value);
      }
    });

    return body;
  }

  var regForm = document.querySelector("[data-reg-form]");

  if (regForm) {
    var status = regForm.querySelector("[data-form-status]");
    var submitBtn = regForm.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent.trim() : "Gửi đăng ký";

    var setFieldError = function (input, message) {
      var field = input.closest(".field");
      var error = field ? field.querySelector(".field-error") : null;

      field.classList.toggle("has-error", Boolean(message));
      input.setAttribute("aria-invalid", message ? "true" : "false");

      if (!error) return;

      error.textContent = message || "";
      error.hidden = !message;
    };

    var setStatus = function (message, tone) {
      if (!status) return;
      status.textContent = message || "";

      if (tone) {
        status.setAttribute("data-tone", tone);
      } else {
        status.removeAttribute("data-tone");
      }
    };

    // Vietnamese mobile numbers: 10 digits starting 03/05/07/08/09,
    // optionally written with +84 or spaces / dots / dashes.
    var isPhone = function (value) {
      var digits = value.replace(/[\s.\-()]/g, "").replace(/^\+?84/, "0");
      return /^0[35789]\d{8}$/.test(digits);
    };

    var validate = function () {
      var name = regForm.elements.name;
      var child = regForm.elements.child;
      var phone = regForm.elements.phone;
      var grade = regForm.elements.grade;
      var firstInvalid = null;

      if (!name.value.trim()) {
        setFieldError(name, "Vui lòng nhập họ và tên phụ huynh.");
        firstInvalid = firstInvalid || name;
      } else {
        setFieldError(name, "");
      }

      if (!child.value.trim()) {
        setFieldError(child, "Vui lòng nhập tên của con.");
        firstInvalid = firstInvalid || child;
      } else {
        setFieldError(child, "");
      }

      if (!phone.value.trim()) {
        setFieldError(phone, "Vui lòng nhập số điện thoại.");
        firstInvalid = firstInvalid || phone;
      } else if (!isPhone(phone.value)) {
        setFieldError(phone, "Số điện thoại chưa đúng định dạng.");
        firstInvalid = firstInvalid || phone;
      } else {
        setFieldError(phone, "");
      }

      if (!grade.value) {
        setFieldError(grade, "Vui lòng chọn cấp lớp của con.");
        firstInvalid = firstInvalid || grade;
      } else {
        setFieldError(grade, "");
      }

      return firstInvalid;
    };

    // Clear a field's error as soon as the parent starts fixing it.
    regForm.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        var field = el.closest(".field");
        if (field && field.classList.contains("has-error")) {
          setFieldError(el, "");
        }
      });
    });

    regForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: only a bot fills the off-screen field. Show the normal
      // success copy so the bot has nothing to learn, but send nothing.
      var trap = regForm.elements.website;

      if (trap && trap.value) {
        setStatus(
          "Đã nhận đăng ký. Trung tâm sẽ liên hệ lại trong giờ làm việc, từ 08:00 đến 19:30.",
          "success",
        );
        return;
      }

      var firstInvalid = validate();

      if (firstInvalid) {
        setStatus("Vui lòng kiểm tra lại các ô được đánh dấu.", "error");
        firstInvalid.focus();
        return;
      }

      var endpoint = (regForm.getAttribute("data-endpoint") || "").trim();

      if (!endpoint) {
        // No endpoint configured yet. Say so honestly and hand the parent
        // a channel that works right now.
        setStatus(
          "Hệ thống đăng ký trực tuyến đang được kết nối. Phụ huynh vui lòng gọi 0866 169 569 hoặc nhắn Zalo để được xếp lịch ngay hôm nay.",
          "error",
        );
        return;
      }

      if (submitBtn) {
        submitBtn.setAttribute("aria-busy", "true");
        submitBtn.textContent = "Đang gửi...";
      }
      setStatus("");

      // Google Forms refuses cross-origin reads, so that mode has to post
      // opaquely: the browser sends the data but hands back nothing we are
      // allowed to inspect. Only an outright network failure is detectable.
      var isGoogleForm = regForm.getAttribute("data-mode") === "google-form";

      if (isGoogleForm) {
        fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          body: buildGoogleFormBody(regForm),
        })
          .then(function () {
            regForm.reset();
            setStatus(
              "Đã gửi đăng ký. Trung tâm sẽ liên hệ lại trong giờ làm việc, từ 08:00 đến 19:30. Nếu cần gấp, phụ huynh gọi 0866 169 569.",
              "success",
            );
          })
          .catch(function () {
            setStatus(
              "Chưa gửi được đăng ký. Phụ huynh vui lòng thử lại hoặc gọi 0866 169 569.",
              "error",
            );
          })
          .finally(function () {
            if (submitBtn) {
              submitBtn.removeAttribute("aria-busy");
              submitBtn.textContent = submitLabel;
            }
          });

        return;
      }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(regForm),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          return res.text().then(function (body) {
            if (!res.ok) throw new Error("HTTP " + res.status);

            // Apps Script answers 200 even when it failed, so the status
            // code alone is not enough: the body has to be checked too.
            // Providers disagree on the flag name, hence both.
            // Apps Script serves its own failures as an HTML error page with
            // status 200, so "not JSON" must count as a failure. Treating an
            // unparseable 200 as success would tell a parent their booking
            // went through while the data was dropped.
            var data = null;

            try {
              data = JSON.parse(body);
            } catch (err) {
              throw new Error("Endpoint trả về nội dung không hợp lệ");
            }

            if (data && (data.ok === false || data.success === false)) {
              throw new Error(data.error || data.message || "Rejected");
            }

            regForm.reset();
            setStatus(
              "Đã nhận đăng ký. Trung tâm sẽ liên hệ lại trong giờ làm việc, từ 08:00 đến 19:30.",
              "success",
            );
          });
        })
        .catch(function () {
          setStatus(
            "Chưa gửi được đăng ký. Phụ huynh vui lòng thử lại hoặc gọi 0866 169 569.",
            "error",
          );
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.removeAttribute("aria-busy");
            submitBtn.textContent = submitLabel;
          }
        });
    });
  }

  // ----------------------------------------------------------
  // 8. Course results modal
  // Chỉ những thẻ mang data-results mới mở được. Bảy khóa còn lại
  // chưa có ảnh kết quả nên cố tình không phản ứng khi bấm: mời bấm
  // rồi không có gì để xem còn tệ hơn là không mời.
  // ----------------------------------------------------------
  var resultsRoot = document.getElementById("results-modal");
  var resultsData = window.NANCY_RESULTS;
  var resultsApi = window.NancyResults;

  if (resultsRoot && resultsData && resultsApi) {
    var resultsModal = resultsApi.createResultsModal(resultsRoot, resultsData);

    document.querySelectorAll("[data-results]").forEach(function (card) {
      var key = card.getAttribute("data-results");

      card.addEventListener("click", function () {
        resultsModal.open(key, card);
      });

      // Article trên trang chủ cần phím Enter/Space thủ công. Các trang con
      // dùng button thật, nên để trình duyệt tự chuyển phím thành click và
      // tránh mở hộp thoại hai lần.
      if (card.tagName !== "BUTTON" && card.tagName !== "A") {
        card.addEventListener("keydown", function (e) {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          resultsModal.open(key, card);
        });
      }
    });
  }
})();
