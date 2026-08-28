(function () {
  "use strict";

  var courses = {
    "happy-kids": {
      name: "Happy Kids",
      level: "Lớp 2 trở xuống",
      image: "images/course-happy-kids.jpg",
      imageAlt: "Học viên nhỏ tuổi tham gia lớp tiếng Anh tương tác",
      intro: "Giai đoạn làm quen tiếng Anh qua âm thanh, hình ảnh, vận động và những tình huống gần gũi với trẻ.",
      outcomes: [
        "Hình thành phản xạ nghe và nói ở mức phù hợp với độ tuổi.",
        "Làm quen từ vựng, âm thanh và mẫu câu cơ bản.",
        "Xây dựng sự tự tin và niềm vui khi sử dụng tiếng Anh.",
      ],
      content: ["Nghe và phát âm", "Từ vựng theo chủ đề", "Giao tiếp qua trò chơi", "Hoạt động sáng tạo"],
    },
    starter: {
      name: "Starter",
      level: "Lớp 3",
      image: "images/course-starter.jpg",
      imageAlt: "Học viên thực hành tiếng Anh trong lớp Starter",
      intro: "Củng cố nền tảng nghe, nói, đọc, viết và chuẩn bị cho lộ trình Cambridge theo cách vừa sức.",
      outcomes: [
        "Sử dụng từ vựng và mẫu câu quen thuộc trong giao tiếp ngắn.",
        "Đọc, viết câu đơn theo chủ đề gần gũi.",
        "Làm quen dạng bài và thói quen học tập có hệ thống.",
      ],
      content: ["Bốn kỹ năng nền tảng", "Phát âm và phản xạ", "Ngữ pháp theo ngữ cảnh", "Bài tập Cambridge làm quen"],
    },
    movers: {
      name: "Movers",
      level: "Lớp 4",
      image: "images/course-movers.jpg",
      imageAlt: "Hoạt động học tập trong chương trình Movers",
      intro: "Mở rộng vốn từ, cấu trúc và khả năng giao tiếp để học viên tiến lên bậc Cambridge tiếp theo.",
      outcomes: [
        "Hiểu và phản hồi các đoạn hội thoại quen thuộc.",
        "Đọc hiểu văn bản ngắn và viết câu có liên kết.",
        "Tăng độ chính xác khi làm bài theo định dạng Cambridge.",
      ],
      content: ["Nghe hiểu có chiến lược", "Nói theo tình huống", "Đọc hiểu ngắn", "Viết câu và đoạn cơ bản"],
    },
    flyers: {
      name: "Flyers",
      level: "Lớp 5",
      image: "images/course-flyers.jpg",
      imageAlt: "Học viên chương trình Flyers tại trung tâm",
      intro: "Hoàn thiện giai đoạn Cambridge thiếu nhi và tạo nền tảng chuyển tiếp sang chương trình KET.",
      outcomes: [
        "Giao tiếp tự tin hơn trong các chủ đề học đường và đời sống.",
        "Đọc hiểu, viết đoạn ngắn với vốn từ rộng hơn.",
        "Sẵn sàng chuyển tiếp lên lộ trình KET khi đạt yêu cầu đầu vào.",
      ],
      content: ["Bốn kỹ năng tích hợp", "Từ vựng mở rộng", "Ngữ pháp theo ngữ cảnh", "Luyện dạng bài Flyers"],
    },
    ket: {
      name: "KET",
      level: "Lớp 6 - 7",
      image: "images/course-ket.jpg",
      imageAlt: "Lớp học chương trình KET",
      intro: "Phát triển năng lực tiếng Anh thực tế ở trình độ A2 và làm quen với yêu cầu học thuật của bậc trung học.",
      outcomes: [
        "Hiểu thông tin chính trong các văn bản và hội thoại quen thuộc.",
        "Giao tiếp trong tình huống đời sống và học tập cơ bản.",
        "Nắm chiến lược làm bài KET theo từng kỹ năng.",
      ],
      content: ["Reading and Writing", "Listening", "Speaking", "Ôn tập và bài kiểm tra mô phỏng"],
      results: "ket",
    },
    pet: {
      name: "PET",
      level: "Lớp 8 - 9",
      image: "images/course-pet.jpg",
      imageAlt: "Học viên theo lộ trình PET",
      intro: "Nâng năng lực sử dụng tiếng Anh độc lập, củng cố bốn kỹ năng và chuẩn bị cho các mục tiêu học thuật cao hơn.",
      outcomes: [
        "Hiểu nội dung chính của văn bản và hội thoại ở nhiều chủ đề.",
        "Diễn đạt ý kiến, trải nghiệm và kế hoạch rõ ràng hơn.",
        "Vận dụng chiến lược làm bài PET theo thời gian thực tế.",
      ],
      content: ["Reading", "Writing", "Listening", "Speaking và kiểm tra mô phỏng"],
      results: "pet",
    },
    ielts: {
      name: "IELTS",
      level: "Từ lớp 10",
      image: "images/course-ielts.jpg",
      imageAlt: "Lớp luyện thi IELTS tại trung tâm",
      intro: "Xây dựng năng lực học thuật và chiến lược làm bài theo mục tiêu cá nhân của học viên.",
      outcomes: [
        "Hiểu yêu cầu và tiêu chí đánh giá của bốn kỹ năng IELTS.",
        "Phát triển vốn từ, ngữ pháp và tư duy trình bày học thuật.",
        "Theo dõi tiến bộ qua bài tập và kiểm tra theo từng giai đoạn.",
      ],
      content: ["Listening", "Academic Reading", "Academic Writing", "Speaking và phản hồi cá nhân"],
      results: "ielts",
    },
    "tang-cuong": {
      name: "Tiếng Anh tăng cường",
      level: "Theo nhu cầu học viên",
      image: "images/about-program.jpg",
      imageAlt: "Giáo viên hướng dẫn nhóm học viên trong lớp",
      intro: "Chương trình bổ trợ giúp củng cố phần kiến thức còn yếu và hỗ trợ mục tiêu học tập hiện tại.",
      outcomes: [
        "Xác định phần kiến thức cần ưu tiên qua trao đổi và kiểm tra đầu vào.",
        "Củng cố kỹ năng theo nhu cầu thực tế của học viên.",
        "Hình thành kế hoạch học tập rõ ràng hơn cho giai đoạn tiếp theo.",
      ],
      content: ["Ôn nền tảng", "Củng cố kỹ năng còn yếu", "Bài tập theo mục tiêu", "Theo dõi tiến bộ"],
    },
    "tao-nguon-6": {
      name: "Luyện thi tạo nguồn tiếng Anh lớp 6",
      level: "Học viên chuẩn bị vào lớp 6",
      image: "images/g3.jpg",
      imageAlt: "Học viên tham gia hoạt động học tiếng Anh",
      intro: "Ôn tập có định hướng cho học viên chuẩn bị tham gia kỳ tuyển chọn tiếng Anh đầu cấp.",
      outcomes: [
        "Hệ thống lại kiến thức tiếng Anh tiểu học.",
        "Làm quen dạng bài và cách phân bổ thời gian.",
        "Nhận diện phần cần bổ sung trước kỳ thi.",
      ],
      content: ["Từ vựng và ngữ pháp", "Đọc hiểu", "Bài tập tổng hợp", "Luyện đề theo giai đoạn"],
    },
    "tuyen-sinh-10": {
      name: "Luyện thi tuyển sinh lớp 10",
      level: "Học viên lớp 9",
      image: "images/IMG_20260803_164921.jpg",
      imageAlt: "Hoạt động vinh danh kết quả học tập của học viên",
      intro: "Hệ thống kiến thức trọng tâm, rèn kỹ năng làm bài và chuẩn bị tâm thế cho kỳ thi tuyển sinh lớp 10.",
      outcomes: [
        "Nắm cấu trúc và các nhóm kiến thức thường gặp trong bài thi.",
        "Cải thiện tốc độ, độ chính xác và cách kiểm soát thời gian.",
        "Theo dõi kết quả luyện đề để điều chỉnh phần cần ưu tiên.",
      ],
      content: ["Ngữ âm và từ vựng", "Ngữ pháp trọng tâm", "Đọc hiểu và viết", "Luyện đề và chữa bài"],
      results: "ts10",
    },
    "dai-hoc": {
      name: "Luyện thi đại học",
      level: "Học viên THPT",
      image: "images/IMG_20260803_164932.jpg",
      imageAlt: "Học viên nhận ghi nhận thành tích tại trung tâm",
      intro: "Củng cố kiến thức THPT và luyện kỹ năng làm bài theo mục tiêu thi tốt nghiệp, xét tuyển của học viên.",
      outcomes: [
        "Hệ thống các nhóm kiến thức quan trọng trong chương trình THPT.",
        "Rèn cách đọc đề, loại trừ và quản lý thời gian.",
        "Điều chỉnh kế hoạch ôn tập dựa trên kết quả luyện đề.",
      ],
      content: ["Từ vựng theo chủ điểm", "Ngữ pháp THPT", "Đọc hiểu", "Luyện đề và phân tích lỗi"],
    },
  };

  var params = new URLSearchParams(window.location.search);
  var slug = params.get("course") || "happy-kids";
  var course = courses[slug] || courses["happy-kids"];

  var setText = function (selector, value) {
    var element = document.querySelector(selector);
    if (element) element.textContent = value;
  };

  setText("[data-course-name]", course.name);
  setText("[data-course-level]", course.level);
  setText("[data-course-intro]", course.intro);
  document.title = course.name + " | Khóa học Thien Uy English Center";

  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = "https://thienuy.edu.vn/course.html?course=" + slug;

  var metaDescription = document.querySelector('meta[name="description"]');
  var fullDescription = course.intro + " Tìm hiểu lộ trình và đăng ký kiểm tra trình độ tại Thien Uy English Center.";
  if (metaDescription) metaDescription.content = fullDescription;

  var setMeta = function (property, value) {
    var element = document.querySelector('meta[property="' + property + '"]');
    if (element) element.content = value;
  };

  setMeta("og:title", course.name + " | Khóa học Thien Uy English Center");
  setMeta("og:description", fullDescription);
  setMeta("og:url", "https://thienuy.edu.vn/course.html?course=" + slug);
  setMeta("og:image", "https://thienuy.edu.vn/" + course.image);

  var schema = document.getElementById("course-schema");
  if (schema) {
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.name,
      description: course.intro,
      provider: {
        "@type": "EducationalOrganization",
        name: "Thien Uy English Center",
        sameAs: "https://thienuy.edu.vn/",
      },
    });
  }

  var image = document.querySelector("[data-course-image]");
  if (image) {
    image.src = course.image;
    image.alt = course.imageAlt;
  }

  var renderList = function (selector, items) {
    var list = document.querySelector(selector);
    if (!list) return;
    list.replaceChildren();
    items.forEach(function (item) {
      var entry = document.createElement("li");
      entry.textContent = item;
      list.appendChild(entry);
    });
  };

  renderList("[data-course-outcomes]", course.outcomes);
  renderList("[data-course-content]", course.content);

  document.querySelectorAll("[data-course-link]").forEach(function (link) {
    var active = link.getAttribute("data-course-link") === slug;
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });

  var resultButton = document.querySelector("[data-course-results]");
  if (resultButton && course.results) {
    resultButton.hidden = false;
    resultButton.setAttribute("data-results", course.results);
  }
})();
