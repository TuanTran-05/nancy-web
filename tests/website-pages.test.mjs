import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const pageNames = [
  "about.html",
  "courses.html",
  "course.html",
  "learning-path.html",
  "achievements.html",
  "activities.html",
  "knowledge.html",
  "teachers.html",
  "faq.html",
  "contact.html",
];
const primaryPageNames = ["about.html", "courses.html", "achievements.html"];
const pageEntries = await Promise.all(
  pageNames.map(async (name) => [
    name,
    await readFile(new URL(`../${name}`, import.meta.url), "utf8"),
  ]),
);
const pages = new Map(pageEntries);
const pagesCss = await readFile(new URL("../pages.css", import.meta.url), "utf8");
const pagesJs = await readFile(new URL("../pages.js", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");

const contentImageTags = (source) =>
  [...source.matchAll(/<img\b[^>]*>/gs)]
    .map(([tag]) => tag)
    .filter(
      (tag) =>
        !tag.includes('class="lightbox-img"') &&
        !tag.includes('id="results-image"') &&
        !/class="[^"]*\b(?:brand-logo|foot-logo-img)\b/.test(tag),
    );

const contentImageMinimums = new Map([
  ["about.html", 5],
  ["courses.html", 13],
  ["course.html", 3],
  ["learning-path.html", 3],
  ["achievements.html", 9],
  ["activities.html", 7],
  ["knowledge.html", 1],
  ["teachers.html", 3],
  ["faq.html", 0],
  ["contact.html", 0],
]);

const assertContentImageMinimum = (name, tags) => {
  assert.ok(contentImageMinimums.has(name), `${name} needs a declared content image minimum`);
  const minimumAssetCount = contentImageMinimums.get(name);
  assert.ok(tags.length >= minimumAssetCount, `${name} needs real visual assets`);
};

test("publishes three complete inner pages with shared accessible navigation", () => {
  const currentPages = new Map([
    ["about.html", "Giới thiệu"],
    ["courses.html", "Khóa học"],
    ["achievements.html", "Thành tích"],
  ]);

  for (const name of primaryPageNames) {
    const html = pages.get(name);
    assert.match(html, /<a class="skip-link" href="#main">/);
    assert.match(html, /<main class="subpage-main" id="main">/);
    assert.match(html, /<nav class="main-nav"[^>]+aria-label="Điều hướng chính"/s);
    assert.match(html, /<button class="nav-toggle"[^>]+aria-expanded="false"/s);
    assert.match(html, /href="styles\.css\?v=20260828-professional-compact"/);
    assert.match(html, /href="pages\.css\?v=20260828-professional-compact"/);
    assert.match(html, /src="script\.js\?v=20260828-professional-compact" defer/);

    for (const route of ["index.html", ...primaryPageNames]) {
      assert.match(html, new RegExp(`href="${route.replace(".", "\\.")}"`));
    }

    const active = [
      ...html.matchAll(/<a href="([^"]+)" aria-current="page">([^<]+)<\/a>/g),
    ];
    assert.equal(active.length, 1, `${name} must have one current nav item`);
    assert.deepEqual(active[0].slice(1), [name, currentPages.get(name)]);
  }
});

test("inner pages use unique canonical metadata and valid structured data", () => {
  const expectations = new Map([
    ["about.html", ["Giới thiệu | Thien Uy English Center", "https://thienuy.edu.vn/about.html"]],
    ["courses.html", ["Khóa học tiếng Anh | Thien Uy English Center", "https://thienuy.edu.vn/courses.html"]],
    ["course.html", ["Chi tiết khóa học | Thien Uy English Center", "https://thienuy.edu.vn/course.html"]],
    ["learning-path.html", ["Lộ trình học tiếng Anh | Thien Uy English Center", "https://thienuy.edu.vn/learning-path.html"]],
    ["achievements.html", ["Thành tích học viên | Thien Uy English Center", "https://thienuy.edu.vn/achievements.html"]],
    ["activities.html", ["Hoạt động học viên | Thien Uy English Center", "https://thienuy.edu.vn/activities.html"]],
    ["knowledge.html", ["Kiến thức tiếng Anh cho phụ huynh | Thien Uy", "https://thienuy.edu.vn/knowledge.html"]],
    ["teachers.html", ["Đội ngũ giáo viên | Thien Uy English Center", "https://thienuy.edu.vn/teachers.html"]],
    ["faq.html", ["Câu hỏi thường gặp | Thien Uy English Center", "https://thienuy.edu.vn/faq.html"]],
    ["contact.html", ["Liên hệ và đăng ký kiểm tra | Thien Uy", "https://thienuy.edu.vn/contact.html"]],
  ]);

  for (const [name, html] of pages) {
    const [title, canonical] = expectations.get(name);
    assert.match(html, new RegExp(`<title>${title}<\\/title>`));
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}" />`));
    const json = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(json, `${name} missing structured data`);
    assert.doesNotThrow(() => JSON.parse(json));
  }
});

test("all inner-page images are local, accessible, dimensioned, and present", async () => {
  for (const [name, html] of pages) {
    const tags = contentImageTags(html);
    assertContentImageMinimum(name, tags);
    const sources = [];

    for (const tag of tags) {
      assert.match(tag, /src="images\/[^"]+"/);
      assert.match(tag, /alt="[^"]*"/);
      assert.match(tag, /width="\d+"/);
      assert.match(tag, /height="\d+"/);
      sources.push(tag.match(/src="(images\/[^"]+)"/)?.[1]);
    }

    await Promise.all(
      [...new Set(sources.filter(Boolean))].map((source) =>
        access(new URL(`../${source}`, import.meta.url)),
      ),
    );
  }
});

test("content image inventory excludes dynamic shells and shared logos", () => {
  const fixture = `
    <img class="brand-logo" src="images/logo.png" alt="" width="52" height="52" />
    <img class="foot-logo-img" src="images/logo.png" alt="" width="46" height="46" />
    <img class="lightbox-img" alt="" />
    <img id="results-image" alt="" />
    <img src="images/g1.jpg" alt="Hoạt động học viên" width="1024" height="1024" />
  `;

  const tags = contentImageTags(fixture);
  assert.equal(tags.length, 1);
  assert.match(tags[0], /src="images\/g1\.jpg"/);
});

test("route content minimum rejects below-contract inventory", () => {
  for (const [name, minimum] of contentImageMinimums) {
    if (minimum === 0) continue;
    const mutatedTags = Array.from(
      { length: minimum - 1 },
      (_, index) =>
        `<img src="images/mutation-${index}.jpg" alt="Mutation" width="100" height="100" />`,
    );

    assert.throws(
      () => assertContentImageMinimum(name, mutatedTags),
      (error) =>
        error instanceof assert.AssertionError &&
        error.message === `${name} needs real visual assets`,
      `${name} must reject ${minimum - 1} genuine content images`,
    );
  }
});

test("about and teachers form one concise story and team family", () => {
  const about = pages.get("about.html");
  const teachers = pages.get("teachers.html");

  assert.match(about, /id="team"/);
  assert.equal((about.match(/class="team-evidence/g) ?? []).length, 2);
  assert.match(about, /href="teachers\.html"/);
  assert.equal((teachers.match(/class="teaching-practice-row/g) ?? []).length, 3);
  assert.doesNotMatch(teachers, /class="teacher-profile/);
  assert.match(teachers, /Hồ sơ đội ngũ đang được trung tâm xác nhận/);
  assert.doesNotMatch(teachers, /ThS\.|Tiến sĩ|IELTS 9\.0|CELTA|TESOL/);
});

test("contact page puts the form first and answers the four key objections", () => {
  const contact = pages.get("contact.html");
  const faq = pages.get("faq.html");
  const contactFormAt = contact.indexOf('id="register"');
  const mapAt = contact.indexOf('id="map"');

  assert.ok(contactFormAt > -1 && mapAt > contactFormAt);
  assert.match(contact, /class="contact-conversion"/);
  assert.equal((contact.match(/<details class="faq-item"/g) ?? []).length, 4);
  assert.equal((faq.match(/<details class="faq-item"/g) ?? []).length, 8);
  for (const question of [
    "Trung tâm có những khóa học nào?",
    "Con chưa từng học tiếng Anh thì bắt đầu từ đâu?",
    "Trước khi vào lớp con có được kiểm tra trình độ không?",
    "Thời lượng, lịch học và sĩ số mỗi lớp như thế nào?",
  ]) {
    assert.ok(contact.includes(question));
  }
});

test("courses page exposes all current programs, filters, and real result entry points", () => {
  const html = pages.get("courses.html");
  const slugs = [...html.matchAll(/data-course="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(slugs, [
    "happy-kids",
    "starter",
    "movers",
    "flyers",
    "ket",
    "pet",
    "ielts",
    "tang-cuong",
    "tao-nguon-anh-6",
    "tuyen-sinh-10",
    "dai-hoc",
  ]);
  assert.equal((html.match(/class="filter-button"/g) ?? []).length, 4);
  assert.deepEqual(
    [...html.matchAll(/data-results="([^"]+)"/g)].map((match) => match[1]),
    ["ket", "pet", "ielts", "ts10"],
  );
  assert.match(html, /id="results-modal"/);
});

test("program pages use the compact catalog and roadmap family", () => {
  const catalog = pages.get("courses.html");
  const path = pages.get("learning-path.html");
  const detail = pages.get("course.html");

  assert.match(catalog, /class="program-layout"/);
  assert.equal((catalog.match(/class="catalog-card reveal/g) ?? []).length, 11);
  assert.equal((catalog.match(/class="filter-button"/g) ?? []).length, 4);
  assert.equal((path.match(/class="learning-roadmap__item/g) ?? []).length, 7);
  assert.equal((path.match(/class="enrollment-step/g) ?? []).length, 4);
  assert.doesNotMatch(path, /class="content-grid"/);
  assert.match(detail, /href="contact\.html#register"[^>]*>Kiểm tra trình độ miễn phí<\/a>/);
});

test("achievements page matches the redacted result data totals", () => {
  const html = pages.get("achievements.html");
  assert.match(html, /<strong>71<\/strong><span>Kết quả được tổng hợp<\/span>/);
  assert.equal((html.match(/class="achievement-card reveal"[^>]*data-filter-item/g) ?? []).length, 4);
  for (const [key, total] of [["ket", 28], ["pet", 11], ["ielts", 8], ["ts10", 24]]) {
    assert.match(html, new RegExp(`<strong>${total}<\\/strong><span>Kết quả<\\/span>`));
    assert.match(html, new RegExp(`data-results="${key}"`));
  }
});

test("achievement summary avoids universal privacy claims", () => {
  const html = pages.get("achievements.html");
  const summary = html.match(/<div class="evidence-summary">[\s\S]*?<\/section>/)?.[0] ?? "";

  assert.doesNotMatch(
    summary,
    /(?:Tất cả|Mọi|Toàn bộ)\s+phiếu điểm[^.]*\b(?:che|ẩn)\b/i,
  );
});

test("evidence and community pages prioritize real assets over generic cards", () => {
  const achievements = pages.get("achievements.html");
  const activities = pages.get("activities.html");
  const knowledge = pages.get("knowledge.html");

  assert.match(achievements, /class="evidence-summary"/);
  assert.equal((achievements.match(/data-results="(?:ket|pet|ielts|ts10)"/g) ?? []).length, 4);
  assert.equal((activities.match(/class="gallery-item gal reveal/g) ?? []).length, 5);
  assert.match(activities, /class="activity-story"/);
  assert.doesNotMatch(activities, /class="content-grid"/);
  assert.equal((knowledge.match(/class="knowledge-feature/g) ?? []).length, 1);
  assert.equal((knowledge.match(/class="knowledge-link-card/g) ?? []).length, 2);
});

test("page filters expose pressed state, live status, and hidden-item behavior", () => {
  assert.match(pagesJs, /querySelectorAll\("\[data-filter-group\]"\)/);
  assert.match(pagesJs, /item\.hidden = !visible/);
  assert.match(pagesJs, /setAttribute\(\s*"aria-pressed"/s);
  assert.match(pagesJs, /status\.textContent/);
  assert.match(pagesCss, /\[data-filter-item\]\[hidden\]\s*\{[^}]*display:\s*none !important/s);
});

test("multi-page styles define responsive collapse and stable mobile viewport behavior", () => {
  assert.match(pagesCss, /min-height:\s*calc\(100dvh - 78px\)/);
  assert.doesNotMatch(pagesCss, /h-screen|100vh/);
  assert.match(pagesCss, /@media \(max-width: 860px\)[\s\S]*?\.page-hero__grid,[\s\S]*?grid-template-columns:\s*1fr/s);
  assert.match(pagesCss, /@media \(max-width: 680px\)[\s\S]*?\.catalog-card,[\s\S]*?grid-column:\s*1 \/ -1/s);
  assert.match(pagesCss, /@media \(prefers-reduced-motion: reduce\)/);
});

test("sitemap publishes the homepage and every new section page", () => {
  for (const url of [
    "https://thienuy.edu.vn/",
    "https://thienuy.edu.vn/about.html",
    "https://thienuy.edu.vn/teachers.html",
    "https://thienuy.edu.vn/courses.html",
    "https://thienuy.edu.vn/course.html",
    "https://thienuy.edu.vn/learning-path.html",
    "https://thienuy.edu.vn/achievements.html",
    "https://thienuy.edu.vn/activities.html",
    "https://thienuy.edu.vn/knowledge.html",
    "https://thienuy.edu.vn/faq.html",
    "https://thienuy.edu.vn/contact.html",
  ]) {
    assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  }
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 11);
});

test("visible website copy avoids long dash characters", () => {
  for (const [name, html] of pages) {
    assert.doesNotMatch(html, /[—–]/, `${name} contains a long dash`);
  }
});
