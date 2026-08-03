import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [html, css, js] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
]);

const sectionMarkup = (id, nextId) => {
  const idIndex = html.indexOf(`id="${id}"`);
  assert.notEqual(idIndex, -1, `missing #${id}`);
  const start = html.lastIndexOf("<section", idIndex);
  const end = nextId
    ? html.lastIndexOf("<section", html.indexOf(`id="${nextId}"`))
    : html.indexOf("</main>", start);
  return html.slice(start, end);
};

const cardMarkup = (slug) => {
  const match = html.match(
    new RegExp(
      `<article class="course-card" data-course="${slug}">([\\s\\S]*?)<\\/article>`,
    ),
  );
  assert.ok(match, `missing course card: ${slug}`);
  return match[1];
};

function relativeLuminance(hex) {
  const channels = hex
    .match(/[a-f\d]{2}/gi)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

test("publishes the local Nancy identity and social metadata", () => {
  assert.match(
    html,
    /<title>\s*Anh Ngữ Nancy An Phú \| Nancy English Center\s*<\/title>/,
  );
  assert.match(
    html,
    /<meta\s+name="description"\s+content="Nancy English Center - Anh Ngữ Nancy An Phú,[^"]+0866 169 569\."\s*\/>/s,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/thienuy\.edu\.vn\/" \/>/,
  );

  const expectedOpenGraph = new Map([
    ["og:type", "website"],
    ["og:locale", "vi_VN"],
    ["og:site_name", "Nancy English Center"],
    ["og:title", "Anh Ngữ Nancy An Phú | Nancy English Center"],
    ["og:url", "https://thienuy.edu.vn/"],
    ["og:image", "https://thienuy.edu.vn/images/logo.png"],
  ]);
  const actualOpenGraph = new Map(
    [...html.matchAll(/<meta\s+property="([^"]+)"\s+content="([^"]+)"\s*\/>/g)].map(
      ([, property, content]) => [property, content],
    ),
  );
  for (const [property, content] of expectedOpenGraph) {
    assert.equal(actualOpenGraph.get(property), content);
  }
});

test("publishes one consistent structured local-business identity", () => {
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(blocks.length, 1);

  const graph = JSON.parse(blocks[0][1])["@graph"];
  const website = graph.find((entry) => entry["@type"] === "WebSite");
  const business = graph.find(
    (entry) =>
      Array.isArray(entry["@type"]) && entry["@type"].includes("LocalBusiness"),
  );

  assert.deepEqual(website, {
    "@type": "WebSite",
    "@id": "https://thienuy.edu.vn/#website",
    url: "https://thienuy.edu.vn/",
    name: "Nancy English Center",
    alternateName: "Anh Ngữ Nancy An Phú",
    inLanguage: "vi-VN",
  });
  assert.equal(business.name, "Nancy English Center");
  assert.equal(business.telephone, "+84866169569");
  assert.equal(business.address.addressLocality, "An Phú");
  assert.equal(business.address.addressRegion, "Hồ Chí Minh");
  assert.deepEqual(business.sameAs, [
    "https://www.facebook.com/anhngunancyanphu?locale=vi_VN",
  ]);
  assert.equal(business.openingHoursSpecification.opens, "08:00");
  assert.equal(business.openingHoursSpecification.closes, "19:30");
});

test("exposes crawl discovery files for the canonical homepage", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(new URL("../robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../sitemap.xml", import.meta.url), "utf8"),
  ]);
  assert.equal(
    robots,
    [
      "User-agent: *",
      "Allow: /",
      "",
      "Sitemap: https://thienuy.edu.vn/sitemap.xml",
      "",
    ].join("\n"),
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/thienuy\.edu\.vn\/<\/loc>/,
  );
  assert.doesNotMatch(sitemap, /<changefreq>|<priority>/);
});

test("loads the versioned local stylesheet and interaction script", () => {
  assert.match(
    html,
    /<link\s+rel="stylesheet"\s+href="styles\.css\?v=20260801-responsive-hero"\s*\/>/,
  );
  assert.match(
    html,
    /<script src="script\.js\?v=20260725-b" defer><\/script>/,
  );
  assert.doesNotMatch(
    html,
    /<(?:link|script)[^>]+(?:href|src)="https:\/\/fonts\.(?:googleapis|gstatic)\.com/i,
  );
});

test("keeps navigation landmarks, anchors, and the two-line brand accessible", () => {
  assert.match(html, /<a class="skip-link" href="#main">/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<button\s+class="nav-toggle"[^>]+aria-expanded="false"/s);
  assert.match(html, /<nav class="main-nav"[^>]+aria-label="Điều hướng chính"/s);
  for (const id of [
    "about",
    "courses",
    "path",
    "activities",
    "register",
    "faq",
    "contact",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
  const brand = html.match(/<a\s+class="brand"[\s\S]*?<\/a>/)?.[0] ?? "";
  assert.match(brand, /<strong>NANCY ENGLISH CENTER<\/strong>/);
  assert.match(brand, /<em>thienuy\.edu\.vn<\/em>/);
});

test("local images exist and image markup reserves layout space", async () => {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gs)].map(([tag]) => tag);
  assert.ok(imageTags.length >= 20);
  const contentImages = imageTags.filter(
    (tag) => !tag.includes('class="lightbox-img"'),
  );
  for (const image of contentImages) {
    assert.match(image, /src="[^"]+"/);
    assert.match(image, /alt="[^"]*"/);
    assert.match(image, /width="\d+"/);
    assert.match(image, /height="\d+"/);
  }

  const localSources = contentImages
    .map((tag) => tag.match(/src="(images\/[^"]+)"/)?.[1])
    .filter(Boolean);
  await Promise.all(
    [...new Set(localSources)].map((source) =>
      access(new URL(`../${source}`, import.meta.url)),
    ),
  );

  assert.match(
    html,
    /<img\s+src="images\/hero\.jpg"[^>]*fetchpriority="high"[^>]*decoding="async"/s,
  );
  assert.ok(imageTags.filter((tag) => tag.includes('loading="lazy"')).length >= 17);
});

test("uses self-hosted Vietnamese fonts and readable brand colors", async () => {
  assert.match(
    css,
    /@font-face\s*\{[^}]*font-family:\s*"Be Vietnam Pro"[^}]*font-display:\s*swap/s,
  );
  assert.match(css, /body\s*\{[^}]*font-family:\s*"Be Vietnam Pro",\s*system-ui/s);
  assert.match(css, /\.hero-title\s*\{[^}]*font-family:\s*"Baloo 2"/s);
  const fontSources = [
    ...new Set([...css.matchAll(/url\("(fonts\/[^"]+\.woff2)"\)/g)].map((match) => match[1])),
  ];
  assert.ok(fontSources.length >= 4);
  await Promise.all(
    fontSources.map((source) => access(new URL(`../${source}`, import.meta.url))),
  );

  const accent = css.match(/--accent:\s*(#[a-f\d]{6})/i)?.[1];
  assert.ok(accent);
  const contrast = 1.05 / (relativeLuminance(accent) + 0.05);
  assert.ok(contrast >= 4.5, `accent contrast against white is ${contrast}`);
});

test("About presents the current photo-led five-pillar layout", () => {
  const about = sectionMarkup("about", "courses");
  assert.match(
    about,
    /<h2 class="h2" id="about-heading">\s*Tự hào <span class="tx-accent">10\+ năm<\/span> giảng dạy tiếng Anh\s*<\/h2>/s,
  );
  assert.match(
    about,
    /<p class="about-motto">UY TÍN - CHẤT LƯỢNG - TẬN TÂM - HIỆU QUẢ<\/p>/,
  );
  assert.match(about, /<figure class="about-figure reveal">/);
  assert.match(about, /src="images\/about-program\.jpg"/);

  const pillars = [
    ...about.matchAll(
      /<li class="pillar reveal"[^>]*>[\s\S]*?<span class="pillar-num"[^>]*>(\d{2})<\/span>[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<\/li>/g,
    ),
  ].map((match) => [match[1], match[2]]);
  assert.deepEqual(pillars, [
    ["01", "Chương trình học bài bản"],
    ["02", "Giáo viên giàu kinh nghiệm"],
    ["03", "Lộ trình cá nhân hóa"],
    ["04", "Quan tâm sát sao"],
    ["05", "Môi trường tích cực"],
  ]);
  assert.match(
    css,
    /\.about-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0?\.92fr\)\s+minmax\(0,\s*1\.08fr\)/s,
  );
  assert.match(
    css,
    /@media \(max-width: 1023px\)[\s\S]*?\.about-grid\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
});

test("Courses present the current learning path and specialty rows", async () => {
  const courses = sectionMarkup("courses", "path");
  assert.match(
    courses,
    /<h2 class="h2" id="courses-heading">\s*Khóa học cho <span class="tx-accent">mọi độ tuổi<\/span>\s*<\/h2>/s,
  );
  assert.equal((courses.match(/data-course-carousel/g) ?? []).length, 2);
  assert.equal((courses.match(/data-course-track/g) ?? []).length, 2);
  assert.equal((courses.match(/data-course-controls/g) ?? []).length, 2);

  const slugs = [
    ...courses.matchAll(/<article class="course-card" data-course="([^"]+)">/g),
  ].map((match) => match[1]);
  assert.deepEqual(slugs, [
    "happy-kids",
    "starter",
    "movers",
    "flyers",
    "ket",
    "pet",
    "ielts",
    "tang-cuong",
    "tuyen-sinh-10",
    "dai-hoc",
    "chuan-bo-gd",
  ]);

  const expectedCards = new Map([
    ["happy-kids", ["Happy Kids", "Lớp 2 trở xuống", "images/IMG_20260803_171902.jpg"]],
    ["starter", ["Starter", "Lớp 3", "images/IMG_20260803_171902.jpg"]],
    ["movers", ["Movers", "Lớp 4", "images/course-movers.jpg"]],
    ["flyers", ["Flyers", "Lớp 5", "https://i.postimg.cc/CMsxrwfT/748931165-1553232163481316-3951940359174119660-n.jpg"]],
    ["ket", ["KET", "Lớp 6-7", "https://i.postimg.cc/Y2WstSzY/749330288-1553232106814655-737978265121435385-n.jpg"]],
    ["pet", ["PET", "Lớp 8-9", "https://i.postimg.cc/cL9mRqcs/748678512-1553231826814683-3540834307928845811-n.jpg"]],
    ["ielts", ["IELTS", "Từ lớp 10", "https://i.postimg.cc/ZRrpDX67/748741212-1553232193481313-2232384107086123280-n.jpg"]],
    ["tang-cuong", ["Tiếng Anh tăng cường", "Theo cấp lớp", "images/course-ket.jpg"]],
    ["tuyen-sinh-10", ["Luyện thi tuyển sinh 10", "Lớp 9", "images/course-pet.jpg"]],
    ["dai-hoc", ["Luyện thi đại học", "Lớp 12", "images/course-ielts.jpg"]],
    ["chuan-bo-gd", ["Chương trình chuẩn Bộ Giáo dục", "Mọi cấp lớp", "images/course-flyers.jpg"]],
  ]);
  for (const [slug, [title, grade, image]] of expectedCards) {
    const card = cardMarkup(slug);
    assert.match(card, new RegExp(`<h4>${title}<\\/h4>`));
    assert.match(card, new RegExp(`<span class="course-card__grade">${grade}<\\/span>`));
    assert.ok(card.includes(`src="${image}"`));
  }

  const sharedCoursePhoto = "images/IMG_20260803_171902.jpg";
  await access(new URL(`../${sharedCoursePhoto}`, import.meta.url));
  for (const slug of ["happy-kids", "starter"]) {
    assert.match(
      cardMarkup(slug),
      /alt="Chứng nhận và lễ vinh danh học viên tại Nancy English Center"/,
    );
  }
});

test("course rows are keyboard-scrollable and expose bounded controls", () => {
  const courses = sectionMarkup("courses", "path");
  const tracks = [
    ...courses.matchAll(
      /<div\s+class="course-track"\s+data-course-track\s+tabindex="0"\s+aria-label="([^"]+)"/g,
    ),
  ];
  assert.equal(tracks.length, 2);
  assert.deepEqual(
    tracks.map((track) => track[1]),
    [
      "Lộ trình các khóa học từ Happy Kids đến IELTS",
      "Các khóa bổ trợ và luyện thi",
    ],
  );
  assert.equal((courses.match(/data-course-prev/g) ?? []).length, 2);
  assert.equal((courses.match(/data-course-next/g) ?? []).length, 2);
  assert.match(
    css,
    /\.course-track\s*\{[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x mandatory/s,
  );
  assert.match(js, /courseTrack\.scrollBy\(\{/);
  assert.match(js, /coursePrev\.disabled/);
  assert.match(js, /courseNext\.disabled/);
});

test("the enrollment path, gallery, and FAQ match their current structure", () => {
  const path = sectionMarkup("path", "activities");
  assert.equal((path.match(/<li class="step reveal"/g) ?? []).length, 4);
  assert.deepEqual(
    [...path.matchAll(/<h3>([^<]+)<\/h3>/g)].map((match) => match[1]),
    ["Liên hệ tư vấn", "Kiểm tra trình độ", "Xếp lớp phù hợp", "Học và theo sát"],
  );

  const activities = sectionMarkup("activities", "register");
  assert.equal((activities.match(/class="gal /g) ?? []).length, 5);
  assert.equal((activities.match(/tabindex="0"/g) ?? []).length, 5);
  assert.equal((activities.match(/role="button"/g) ?? []).length, 5);
  assert.match(html, /<button class="lightbox-close" type="button"/);
  assert.match(
    css,
    /\.gal:hover figcaption,\s*\.gal:focus-visible figcaption\s*\{[^}]*opacity:\s*1/s,
  );

  const faq = sectionMarkup("faq", "contact");
  assert.equal((faq.match(/<details class="faq-item"/g) ?? []).length, 5);
});

test("registration form maps the current Google Form fields and remains accessible", () => {
  const register = sectionMarkup("register", "faq");
  assert.match(register, /data-mode="google-form"/);
  assert.match(
    register,
    /data-endpoint="https:\/\/docs\.google\.com\/forms\/d\/e\/[^"]+\/formResponse"/,
  );
  const entries = new Map(
    [...register.matchAll(/name="([^"]+)"\s+data-entry="([^"]+)"/g)].map(
      ([, name, entry]) => [name, entry],
    ),
  );
  assert.deepEqual(entries, new Map([
    ["name", "entry.380148302"],
    ["phone", "entry.1988606558"],
    ["child", "entry.1215349974"],
    ["grade", "entry.1485252148"],
    ["note", "entry.153390468"],
  ]));
  assert.match(register, /name="website"[^>]*tabindex="-1"/s);
  assert.match(register, /data-form-status\s+role="status"\s+aria-live="polite"/s);
});

test("contact details expose working phone, email, Zalo, and map destinations", () => {
  const contact = sectionMarkup("contact");
  assert.match(contact, /href="tel:0866169569"/);
  assert.match(contact, /href="mailto:thienuy@gmail\.com"/);
  assert.match(contact, /href="https:\/\/zalo\.me\/1175234011658712481"/);
  assert.match(contact, /Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256/);
  assert.match(contact, /Thứ Hai đến Chủ Nhật, 08:00-19:30/);
  assert.match(contact, /<iframe[^>]+title="Bản đồ vị trí Anh Ngữ Nancy An Phú"/s);
  assert.doesNotMatch(html, /1900 886866/);
});

test("visible page copy uses regular hyphens and the clock icon path is numeric", () => {
  assert.doesNotMatch(html, /[—–]/);
  const clockPath = html.match(/d="(M11\.99 2C6\.47[^\"]+)"/)?.[1];
  assert.ok(clockPath);
  assert.match(clockPath, /M11\.99 2C6\.47 2 2 6\.48 2 12/);
  assert.match(clockPath, /\.5-13H11v6l5\.2 3\.2/);
});
