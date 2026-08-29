import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const pageNames = [
  "index.html",
  "about.html",
  "teachers.html",
  "courses.html",
  "course.html",
  "learning-path.html",
  "achievements.html",
  "activities.html",
  "knowledge.html",
  "faq.html",
  "contact.html",
];

const pageEntries = await Promise.all(
  pageNames.map(async (name) => [name, await readFile(new URL(name, root), "utf8")]),
);
const pages = new Map(pageEntries);
const html = pages.get("index.html");
const css = await readFile(new URL("styles.css", root), "utf8");
const pageCss = await readFile(new URL("pages.css", root), "utf8");
const courseJs = await readFile(new URL("course-detail.js", root), "utf8");
const gitignore = await readFile(new URL(".gitignore", root), "utf8");
const imagesDir = new URL("images/", root);
const imageEntries = await readdir(imagesDir, { withFileTypes: true });

const section = (source, id) => {
  const index = source.indexOf(`id="${id}"`);
  assert.notEqual(index, -1, `missing #${id}`);
  const start = source.lastIndexOf("<section", index);
  const end = source.indexOf("</section>", index);
  return source.slice(start, end + 10);
};

const primaryNavHrefs = [
  "about.html",
  "courses.html",
  "learning-path.html",
  "achievements.html",
  "contact.html",
];

const navMarkup = (source) => {
  const match = source.match(/<nav class="main-nav"[\s\S]*?<\/nav>/);
  assert.ok(match, "missing primary navigation");
  return match[0];
};

test("uses the approved five-route navigation and conversion shell", () => {
  for (const [name, source] of pages) {
    const nav = navMarkup(source);
    const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(hrefs, primaryNavHrefs, `${name} primary nav`);
    const headerCta = source.match(/<div class="header-cta">[\s\S]*?<\/div>/)?.[0];
    assert.ok(headerCta, `${name} missing header CTA`);
    assert.match(headerCta, />Kiểm tra trình độ miễn phí<\/a>/, name);
    assert.match(source, /class="mobile-action-bar"[\s\S]*href="tel:0866169569"[\s\S]*>Gọi tư vấn<[\s\S]*>Kiểm tra trình độ miễn phí</s, name);
  }

  for (const name of ["index.html", "contact.html"]) {
    assert.match(
      pages.get(name),
      /class="mobile-action-bar__register" href="#register">Kiểm tra trình độ miễn phí<\/a>/,
      `${name} mobile registration target`,
    );
  }
});

test("locks the approved Professional Compact tokens", () => {
  assert.match(css, /--brand:\s*#0e4ea1/i);
  assert.match(css, /--brand-strong:\s*#0a3b7d/i);
  assert.match(css, /--accent:\s*#c24c00/i);
  assert.match(css, /--accent-hover:\s*#A84200/);
  assert.match(css, /--accent-ink:\s*#B04500/);
  assert.match(css, /--wrap:\s*1280px/);
  assert.match(css, /--gutter:\s*clamp\(16px,\s*3\.6vw,\s*48px\)/);
  assert.match(css, /--section-y:\s*clamp\(28px,\s*3\.2vw,\s*48px\)/);
  assert.match(css, /--section-y-mobile:\s*clamp\(20px,\s*5\.5vw,\s*32px\)/);
});

test("publishes Thien Uy as the primary identity and Nancy as the legacy identity", () => {
  assert.match(html, /<title>Thien Uy English Center \| Anh ngữ tại An Phú<\/title>/);
  assert.match(html, /content="Thien Uy English Center, tiền thân Nancy English Center,/);
  assert.match(html, /<link rel="canonical" href="https:\/\/thienuy\.edu\.vn\/" \/>/);
  assert.match(html, /<strong>THIEN UY ENGLISH CENTER<\/strong>/);
  assert.match(html, /Tiền thân là Nancy English Center tại An Phú/);

  const structured = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(structured);
  const graph = JSON.parse(structured[1])["@graph"];
  const website = graph.find((entry) => entry["@type"] === "WebSite");
  const business = graph.find((entry) => Array.isArray(entry["@type"]));
  assert.equal(website.name, "Thien Uy English Center");
  assert.deepEqual(website.alternateName, ["Nancy English Center", "Anh Ngữ Nancy An Phú"]);
  assert.equal(business.telephone, "+84866169569");
  assert.equal(business.email, "thienuy@gmail.com");
  assert.equal(business.openingHoursSpecification.opens, "08:00");
  assert.equal(business.openingHoursSpecification.closes, "19:30");
});

test("publishes the complete multi-page information architecture", async () => {
  const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expected = pageNames.map((name) =>
    name === "index.html" ? "https://thienuy.edu.vn/" : `https://thienuy.edu.vn/${name}`,
  );
  assert.deepEqual([...locations].sort(), [...expected].sort());

  for (const name of pageNames) {
    assert.match(pages.get(name), /<main[^>]+id="main"/s, `${name} missing main landmark`);
    assert.match(pages.get(name), /class="skip-link" href="#main"/, `${name} missing skip link`);
  }
});

test("uses one accessible shared header and keeps primary navigation compact", () => {
  for (const [name, source] of pages) {
    assert.match(source, /<nav class="main-nav"[^>]+aria-label="Điều hướng chính"/s, name);
    assert.match(source, /class="nav-toggle"[^>]+aria-expanded="false"[^>]+aria-controls="main-nav"/s, name);
    for (const href of ["index.html", "about.html", "courses.html", "achievements.html", "learning-path.html"]) {
      assert.ok(source.includes(`href="${href}"`), `${name} missing ${href}`);
    }
  }

  const tabletHeaderStart = css.indexOf("@media (max-width: 1120px)");
  assert.notEqual(tabletHeaderStart, -1);
  const rules = css.slice(tabletHeaderStart, css.indexOf("@media (max-width: 980px)"));
  assert.match(rules, /\.main-nav,\s*\.header-cta\s*\{\s*display:\s*none;/s);
  assert.match(rules, /\.nav-toggle\s*\{\s*display:\s*flex;/s);
});

test("every internal page and hash link resolves", async () => {
  for (const [name, source] of pages) {
    const links = [...source.matchAll(/<a\b[^>]*href="([^\"]+)"/g)].map((match) => match[1]);
    for (const href of links) {
      if (/^(?:https?:|mailto:|tel:)/.test(href)) continue;
      const [pathWithQuery, hash] = href.split("#");
      const path = pathWithQuery.split("?")[0] || name;
      const target = pages.get(path);
      assert.ok(target, `${name}: missing internal target ${path}`);
      if (hash) assert.ok(target.includes(`id="${hash}"`), `${name}: missing #${hash} in ${path}`);
    }
  }
});

test("homepage follows the approved A2 conversion sequence", () => {
  assert.doesNotMatch(html, /class="home-kicker"/);
  assert.match(
    html,
    /<h1[^>]*>\s*TIẾNG ANH VỮNG VÀNG -\s*<br\s*\/?>\s*<span>TƯƠNG LAI TƯƠI SÁNG<\/span>\s*<\/h1>/s,
  );
  const ids = ["trust", "featured-courses", "method", "results", "register"];
  const positions = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position > -1));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.equal((html.match(/class="home-program-card/g) ?? []).length, 3);
  assert.equal((html.match(/class="home-fact/g) ?? []).length, 4);
  assert.doesNotMatch(html, /class="home-bento/);
  assert.doesNotMatch(html, /id="process-heading"/);
  assert.match(section(html, "register"), />Kiểm tra trình độ miễn phí<\/h2>/);
});

test("homepage and contact page keep the exact live Google Forms field mapping", () => {
  const expected = new Map([
    ["name", "entry.380148302"],
    ["phone", "entry.1988606558"],
    ["child", "entry.1215349974"],
    ["grade", "entry.1485252148"],
    ["note", "entry.153390468"],
  ]);

  for (const name of ["index.html", "contact.html"]) {
    const source = pages.get(name);
    const form = section(source, "register");
    assert.match(form, /data-mode="google-form"/);
    assert.match(form, /data-endpoint="https:\/\/docs\.google\.com\/forms\/d\/e\/1FAIpQLScZ61EKmEnvKekNxQALbSdPsFqJ7B7WB7fUYYF63QL_F_7sKg\/formResponse"/);
    const fields = new Map(
      [...form.matchAll(/name="([^"]+)"\s+data-entry="([^"]+)"/g)].map((match) => [match[1], match[2]]),
    );
    assert.deepEqual(fields, expected, name);
    assert.match(form, /name="website"[^>]*tabindex="-1"/s);
    assert.match(form, /data-form-status role="status" aria-live="polite"/);
  }
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

test("all public page images are local, accessible and dimensioned", async () => {
  const assets = new Set();
  for (const [name, source] of pages) {
    const tags = [...source.matchAll(/<img\b[^>]*>/gs)].map((match) => match[0]);
    assert.ok(tags.length > 0, `${name} has no images`);
    for (const tag of tags) {
      if (tag.includes('class="lightbox-img"') || tag.includes('id="results-image"')) continue;
      assert.match(tag, /src="images\/[^\"]+"/, `${name}: non-local or missing image source`);
      assert.match(tag, /alt="[^\"]*"/, `${name}: missing alt`);
      assert.match(tag, /width="\d+"/, `${name}: missing width`);
      assert.match(tag, /height="\d+"/, `${name}: missing height`);
      assets.add(tag.match(/src="([^\"]+)"/)[1]);
    }
    assert.doesNotMatch(source, /<img[^>]+src="https?:\/\//s, `${name}: externally hosted image`);
  }
  await Promise.all([...assets].map((asset) => access(new URL(asset, root))));
});

test("course catalog exposes all 11 programs and a reusable detail route", () => {
  const catalog = pages.get("courses.html");
  const detailLinks = [...catalog.matchAll(/href="course\.html\?course=([^\"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(detailLinks, [
    "happy-kids", "starter", "movers", "flyers", "ket", "pet", "ielts",
    "tang-cuong", "tao-nguon-6", "tuyen-sinh-10", "dai-hoc",
  ]);
  assert.equal((catalog.match(/class="catalog-card reveal"/g) ?? []).length, 11);
  assert.equal((catalog.match(/data-results="(?:ket|pet|ielts|ts10)"/g) ?? []).length, 4);
  assert.equal((courseJs.match(/^    "?[a-z0-9-]+"?: \{$/gm) ?? []).length, 11);
  assert.match(pages.get("course.html"), /Thời lượng<\/dt><dd class="data-pending">Liên hệ để xác nhận/);
  assert.match(pages.get("course.html"), /Lịch học và sĩ số<\/dt><dd class="data-pending">Theo lớp đang mở/);
  assert.match(pages.get("course.html"), /Học phí<\/dt><dd class="data-pending">Liên hệ trung tâm/);
});

test("course detail avoids unsupported placement-test duration claims", () => {
  const detail = pages.get("course.html");
  assert.doesNotMatch(
    detail,
    /(?:bài kiểm tra|kiểm tra trình độ)[^<]{0,32}\b(?:ngắn|nhanh)\b/i,
  );
});

test("dedicated pages carry the promised depth without fabricated profiles", () => {
  const about = pages.get("about.html");
  const teachers = pages.get("teachers.html");
  const path = pages.get("learning-path.html");
  const activities = pages.get("activities.html");
  const knowledge = pages.get("knowledge.html");
  const faq = pages.get("faq.html");

  assert.match(about, /Tiền thân là Nancy English Center tại An Phú/);
  assert.equal((about.match(/class="principle reveal"/g) ?? []).length, 5);
  assert.equal((teachers.match(/class="teaching-practice-row/g) ?? []).length, 3);
  assert.doesNotMatch(teachers, /class="teacher-profile/);
  assert.match(teachers, /Hồ sơ đội ngũ đang được trung tâm xác nhận/);
  assert.doesNotMatch(teachers, /ThS\.|Tiến sĩ|IELTS 9\.0|CELTA|TESOL/);
  assert.equal((path.match(/class="learning-roadmap__item/g) ?? []).length, 7);
  assert.equal((path.match(/class="enrollment-step/g) ?? []).length, 4);
  assert.doesNotMatch(path, /class="content-grid"/);
  assert.equal((activities.match(/class="gallery-item gal reveal"/g) ?? []).length, 5);
  assert.equal((knowledge.match(/class="knowledge-feature/g) ?? []).length, 1);
  assert.equal((knowledge.match(/class="knowledge-link-card/g) ?? []).length, 2);
  assert.equal((faq.match(/<details class="faq-item"/g) ?? []).length, 8);
});

test("contact page exposes every verified channel and address", () => {
  const contact = pages.get("contact.html");
  assert.match(contact, /href="tel:0866169569"/);
  assert.match(contact, /href="mailto:thienuy@gmail\.com"/);
  assert.match(contact, /href="https:\/\/zalo\.me\/1175234011658712481"/);
  assert.match(contact, /href="https:\/\/maps\.app\.goo\.gl\/Gme3adX9ZEsUhnwYA"/);
  assert.match(contact, /Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256/);
  assert.match(contact, /<iframe title="Bản đồ đến Thien Uy English Center"/);
});

test("self-hosted typography, responsive layouts and reduced motion remain available", async () => {
  assert.match(css, /font-family:\s*"Be Vietnam Pro"/);
  assert.match(css, /font-family:\s*"Baloo 2"/);
  assert.match(pageCss, /@media \(max-width: 900px\)/);
  assert.match(pageCss, /@media \(max-width: 680px\)/);
  assert.match(pageCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(pageCss, /\.home-hero__grid[\s\S]*grid-template-columns:/);
  const fontFiles = [...new Set([...css.matchAll(/url\("(fonts\/[^\"]+\.woff2)"\)/g)].map((match) => match[1]))];
  await Promise.all(fontFiles.map((file) => access(new URL(file, root))));
});

test("limits eyebrow labels and uses one primary CTA label", () => {
  for (const [name, source] of pages) {
    const sectionCount = (source.match(/<section\b/g) ?? []).length;
    const eyebrowCount = (source.match(/class="[^"]*section-label[^"]*"/g) ?? []).length;
    assert.ok(eyebrowCount <= Math.ceil(sectionCount / 3), `${name}: ${eyebrowCount} eyebrows for ${sectionCount} sections`);

    const primaryLabels = [...source.matchAll(/class="[^"]*btn-accent[^"]*"[^>]*>([^<]+)<\/a>/g)]
      .map((match) => match[1].trim())
      .filter((label) => /kiểm tra|đăng ký|tư vấn/i.test(label));
    assert.ok(primaryLabels.every((label) => label === "Kiểm tra trình độ miễn phí"), `${name}: inconsistent primary CTA`);
  }
});

test("keeps the approved compact responsive and motion rules", () => {
  const allCss = `${css}\n${pageCss}`;
  assert.doesNotMatch(allCss, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.doesNotMatch(allCss, /\b100vh\b|h-screen/);
  assert.match(allCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(allCss, /:where\(a, button, input, select, textarea, summary, \[tabindex\]\):focus-visible/);
  assert.match(allCss, /animation-duration:\s*0\.01ms !important;/);
  assert.match(allCss, /\.page-section,\s*\.section\s*\{\s*padding-block:\s*var\(--section-y-mobile\);/s);
  assert.match(allCss, /input,\s*select,\s*textarea\s*\{\s*font-size:\s*1rem;/s);
  assert.match(allCss, /\.mobile-action-bar/);
});

test("keeps mobile controls touch-safe and clear of the fixed action bar", () => {
  assert.match(css, /\.nav-toggle\s*\{[^}]*min-width:\s*44px;[^}]*min-height:\s*44px;/s);
  assert.match(css, /\.field input,\s*\.field select\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(css, /body\s*\{[^}]*padding-bottom:\s*calc\([^;]*env\(safe-area-inset-bottom\)[^;]*\);/s);
  assert.match(css, /\.results-close\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(css, /\.results-nav\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(
    css,
    /@media \(max-width: 720px\)[\s\S]*?\.results-detail__stage\s*\{[^}]*grid-template-columns:\s*44px minmax\(0, 1fr\) 44px;/s,
  );
});

test("keeps Vietnamese display marks clear of tight title line boxes", () => {
  assert.match(pageCss, /\.page-title,\s*\.home-title\s*\{[^}]*padding-block:\s*0\.04em;/s);
});

test("keeps the shared focus ring visible on form controls", () => {
  const fieldFocus = css.match(
    /\.field input:focus-visible,\s*\.field select:focus-visible,\s*\.field textarea:focus-visible\s*\{([^}]*)\}/s,
  );
  assert.ok(fieldFocus, "missing form focus styles");
  assert.doesNotMatch(fieldFocus[1], /outline:\s*none/);
  assert.match(fieldFocus[1], /outline:\s*3px solid color-mix\(in srgb, var\(--accent\) 72%, white\);/);
});

test("result-enabled pages load data and modal code before the interaction script", () => {
  for (const name of ["courses.html", "achievements.html", "course.html"]) {
    const source = pages.get(name);
    const dataAt = source.indexOf('src="results-data.js');
    const modalAt = source.indexOf('src="results-modal.js');
    const mainAt = source.indexOf('src="script.js');
    assert.ok(dataAt > -1 && modalAt > dataAt && mainAt > modalAt, name);
    assert.match(source, /id="results-modal"[\s\S]*aria-hidden="true"/);
  }
});

test("visible website copy avoids long dash characters", () => {
  for (const [name, source] of pages) {
    const visible = source.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "");
    assert.doesNotMatch(visible, /[—–]/, name);
  }
});

test("raw and unreviewed result images stay out of the deployed directory", async () => {
  const leaked = imageEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /result/i.test(name) && name !== "results");
  assert.deepEqual(leaked, []);

  const reviewed = ["IMG_20260803_164921.jpg", "IMG_20260803_164932.jpg", "IMG_20260803_171902.jpg"];
  const cameraNamed = imageEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^IMG[-_]\d+[-_]\d+\.(jpe?g|png)$/i.test(name))
    .sort();
  assert.deepEqual(cameraNamed, reviewed.sort());

  for (const [key, count] of Object.entries({ ket: 28, pet: 11, ielts: 8, ts10: 24 })) {
    const files = await readdir(new URL(`images/results/${key}/`, root));
    assert.equal(files.filter((name) => name.endsWith(".jpg")).length, count, key);
  }
  assert.match(gitignore, /^_private\/$/m);
  for (const source of pages.values()) {
    assert.doesNotMatch(source, /images\/(ielts|ket|pet)result\/|images\/result10\//);
  }
});

test("all pages publish the final Professional Compact asset versions", () => {
  for (const [name, source] of pages) {
    assert.match(source, /href="styles\.css\?v=20260828-professional-compact"/, `${name} styles version`);
    assert.match(source, /href="pages\.css\?v=20260828-professional-compact"/, `${name} pages version`);
    assert.match(source, /src="script\.js\?v=20260828-professional-compact"/, `${name} script version`);
  }
});

test("all routes retain canonical metadata and valid structured data", () => {
  for (const [name, source] of pages) {
    const canonical = name === "index.html"
      ? "https://thienuy.edu.vn/"
      : `https://thienuy.edu.vn/${name}`;
    const jsonBlocks = [...source.matchAll(
      /<script type="application\/ld\+json"(?: id="[^"]+")?>([\s\S]*?)<\/script>/g,
    )];

    assert.match(source, /<title>[^<]+<\/title>/, `${name} title`);
    assert.match(
      source,
      /<meta\s+name="description"\s+content="[^"]+"\s*\/?>/s,
      `${name} description`,
    );
    assert.ok(
      source.includes(`<link rel="canonical" href="${canonical}" />`),
      `${name} canonical`,
    );
    assert.ok(jsonBlocks.length > 0, `${name} structured data`);

    for (const [, json] of jsonBlocks) {
      assert.doesNotThrow(() => JSON.parse(json), `${name} structured data JSON`);
    }
  }
});
