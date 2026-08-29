# Nancy Local Brand SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Configure the Nancy English Center homepage so Google can crawl it and associate it with the branded queries `anh ngữ nancy an phú` and `nancy english center`.

**Architecture:** Keep the existing static site and add SEO signals at three boundaries: page metadata and visible copy in `index.html`, a single JSON-LD `@graph` for website/business identity, and root crawl-discovery files. Extend the existing Node contract suite so every critical business fact and URL is checked against real project files.

**Tech Stack:** Static HTML5, JSON-LD/schema.org, XML sitemap, Node.js built-in test runner.

## Global Constraints

- Canonical production URL is exactly `https://thienuy.edu.vn/`.
- Primary brand is `Nancy English Center`; alternate brand is `Anh Ngữ Nancy An Phú`.
- Visible hotline is `0866 169 569`; machine-readable phone is `+84866169569`; every call link remains `tel:0866169569`.
- Address is `Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256`, country `VN`.
- Opening hours are Monday through Sunday, `08:00` to `19:30`.
- Facebook URL is `https://www.facebook.com/anhngunancyanphu?locale=vi_VN`.
- Do not add `meta keywords`, fabricated reviews, ratings, or geographic coordinates.
- Preserve the current layout, colors, images, interactions, and all unrelated copy.
- The existing page contract rejects literal en/em dashes in `index.html`; production copy must therefore use regular hyphens.
- This workspace is not a valid Git repository. Do not run commit commands; use the named test checkpoints after each task.

---

## File Structure

- Modify `index.html`: page metadata, visible brand/location copy, and JSON-LD identity graph.
- Modify `tests/page-contract.test.mjs`: SEO, business-identity, robots, and sitemap contracts.
- Create `robots.txt`: crawler access policy and sitemap discovery.
- Create `sitemap.xml`: canonical homepage discovery.
- Verify `tests/page-behavior.test.mjs`: unchanged behavior regression suite.

### Task 1: Homepage metadata and visible brand copy

**Files:**
- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html:4-15`
- Modify: `index.html:103-107`

**Interfaces:**
- Consumes: the `html` string already loaded from `index.html`.
- Produces: canonical URL and brand metadata used again by JSON-LD and sitemap tests.

- [ ] **Step 1: Write the failing metadata test**

Insert after `keeps the supplied image assets and page anchors` in `tests/page-contract.test.mjs`:

```js
test("publishes the approved local brand metadata", () => {
  assert.match(
    html,
    /<title>\s*Anh Ngữ Nancy An Phú \| Nancy English Center\s*<\/title>/,
  );
  assert.match(
    html,
    /<meta\s+name="description"\s+content="Nancy English Center - Anh Ngữ Nancy An Phú, trung tâm tiếng Anh tại Hồ Chí Minh dành cho thiếu nhi và thiếu niên\. Liên hệ 0866 169 569\."\s*\/>/s,
  );
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/thienuy\.edu\.vn\/" \/>/,
  );

  const expectedOpenGraph = [
    ['og:type', 'website'],
    ['og:locale', 'vi_VN'],
    ['og:site_name', 'Nancy English Center'],
    ['og:title', 'Anh Ngữ Nancy An Phú | Nancy English Center'],
    [
      'og:description',
      'Nancy English Center - Anh Ngữ Nancy An Phú, trung tâm tiếng Anh tại Hồ Chí Minh dành cho thiếu nhi và thiếu niên. Liên hệ 0866 169 569.',
    ],
    ['og:url', 'https://thienuy.edu.vn/'],
    ['og:image', 'https://thienuy.edu.vn/images/logo.png'],
  ];

  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  for (const [property, content] of expectedOpenGraph) {
    assert.match(
      html,
      new RegExp(
        `<meta\\s+property="${escapeRegex(property)}"\\s+content="${escapeRegex(content)}"\\s*\\/>`,
        "s",
      ),
    );
  }

  assert.match(
    html,
    /Nancy English Center - Anh Ngữ Nancy An Phú đồng hành cùng học viên/,
  );
  assert.doesNotMatch(html, /<meta[^>]+name="keywords"/i);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="publishes the approved local brand metadata" tests/page-contract.test.mjs
```

Expected: FAIL because the current title, canonical, Open Graph fields, and alternate-brand hero copy are missing.

- [ ] **Step 3: Add the approved metadata**

Replace the current title and description at the top of `index.html`, then place canonical and Open Graph tags immediately after the description:

```html
    <title>Anh Ngữ Nancy An Phú | Nancy English Center</title>
    <meta
      name="description"
      content="Nancy English Center - Anh Ngữ Nancy An Phú, trung tâm tiếng Anh tại Hồ Chí Minh dành cho thiếu nhi và thiếu niên. Liên hệ 0866 169 569."
    />
    <link rel="canonical" href="https://thienuy.edu.vn/" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="vi_VN" />
    <meta property="og:site_name" content="Nancy English Center" />
    <meta
      property="og:title"
      content="Anh Ngữ Nancy An Phú | Nancy English Center"
    />
    <meta
      property="og:description"
      content="Nancy English Center - Anh Ngữ Nancy An Phú, trung tâm tiếng Anh tại Hồ Chí Minh dành cho thiếu nhi và thiếu niên. Liên hệ 0866 169 569."
    />
    <meta property="og:url" content="https://thienuy.edu.vn/" />
    <meta
      property="og:image"
      content="https://thienuy.edu.vn/images/logo.png"
    />
```

Replace the hero paragraph with:

```html
          <p class="hero-sub">
            Nancy English Center - Anh Ngữ Nancy An Phú đồng hành cùng học
            viên phát triển nền tảng tiếng Anh vững chắc, tự tin giao tiếp và
            sẵn sàng cho tương lai.
          </p>
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="publishes the approved local brand metadata" tests/page-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 5: Run the full contract checkpoint**

Run:

```powershell
node --test tests/page-contract.test.mjs
```

Expected: all active tests pass; skipped legacy tests remain skipped.

### Task 2: Structured business identity and visible contact data

**Files:**
- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html` inside `<head>`
- Modify: `index.html:820-838`
- Modify: `index.html:1110-1145`

**Interfaces:**
- Consumes: canonical URL and exact brand strings from Task 1.
- Produces: one valid JSON-LD graph containing `WebSite` and the local educational business.

- [ ] **Step 1: Write the failing identity test**

Add to `tests/page-contract.test.mjs`:

```js
test("publishes one consistent local business identity", () => {
  const jsonLdBlocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(jsonLdBlocks.length, 1);

  const structuredData = JSON.parse(jsonLdBlocks[0][1]);
  assert.equal(structuredData["@context"], "https://schema.org");
  assert.ok(Array.isArray(structuredData["@graph"]));

  const website = structuredData["@graph"].find(
    (entry) => entry["@type"] === "WebSite",
  );
  assert.deepEqual(website, {
    "@type": "WebSite",
    "@id": "https://thienuy.edu.vn/#website",
    url: "https://thienuy.edu.vn/",
    name: "Nancy English Center",
    alternateName: "Anh Ngữ Nancy An Phú",
    inLanguage: "vi-VN",
  });

  const business = structuredData["@graph"].find(
    (entry) =>
      Array.isArray(entry["@type"]) &&
      entry["@type"].includes("EducationalOrganization") &&
      entry["@type"].includes("LocalBusiness"),
  );
  assert.deepEqual(business.address, {
    "@type": "PostalAddress",
    streetAddress: "Đường Nguyễn Văn Trỗi",
    addressLocality: "An Phú",
    addressRegion: "Hồ Chí Minh",
    postalCode: "75256",
    addressCountry: "VN",
  });
  assert.equal(business.name, "Nancy English Center");
  assert.equal(business.alternateName, "Anh Ngữ Nancy An Phú");
  assert.equal(business.url, "https://thienuy.edu.vn/");
  assert.equal(business.logo, "https://thienuy.edu.vn/images/logo.png");
  assert.equal(business.image, "https://thienuy.edu.vn/images/logo.png");
  assert.equal(business.telephone, "+84866169569");
  assert.deepEqual(business.sameAs, [
    "https://www.facebook.com/anhngunancyanphu?locale=vi_VN",
  ]);
  assert.deepEqual(business.openingHoursSpecification, {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "19:30",
  });

  assert.match(
    html,
    /Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256/,
  );
  assert.match(html, /Thứ Hai đến Chủ Nhật, 08:00-19:30/);
  assert.match(html, /0866 169 569/);
  assert.doesNotMatch(html, /1900 886866/);
  assert.equal((html.match(/href="tel:0866169569"/g) ?? []).length >= 1, true);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="publishes one consistent local business identity" tests/page-contract.test.mjs
```

Expected: FAIL because there is no JSON-LD block and the full address/hours are not visible.

- [ ] **Step 3: Add the JSON-LD graph**

Insert before `<!-- Fonts -->` in `index.html`:

```html
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://thienuy.edu.vn/#website",
            "url": "https://thienuy.edu.vn/",
            "name": "Nancy English Center",
            "alternateName": "Anh Ngữ Nancy An Phú",
            "inLanguage": "vi-VN"
          },
          {
            "@type": ["EducationalOrganization", "LocalBusiness"],
            "@id": "https://thienuy.edu.vn/#organization",
            "name": "Nancy English Center",
            "alternateName": "Anh Ngữ Nancy An Phú",
            "url": "https://thienuy.edu.vn/",
            "logo": "https://thienuy.edu.vn/images/logo.png",
            "image": "https://thienuy.edu.vn/images/logo.png",
            "telephone": "+84866169569",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Đường Nguyễn Văn Trỗi",
              "addressLocality": "An Phú",
              "addressRegion": "Hồ Chí Minh",
              "postalCode": "75256",
              "addressCountry": "VN"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "08:00",
              "closes": "19:30"
            },
            "sameAs": [
              "https://www.facebook.com/anhngunancyanphu?locale=vi_VN"
            ]
          }
        ]
      }
    </script>
```

- [ ] **Step 4: Update visible contact information**

Replace the current contact address text with:

```html
                <span>
                  <strong>Địa chỉ</strong>
                  Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256
                  <small>Thứ Hai đến Chủ Nhật, 08:00-19:30</small>
                </span>
```

Replace the footer address text `Thành phố Hồ Chí Minh` with:

```html
            Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256
```

Add this footer paragraph immediately after the address paragraph:

```html
          <p>Thứ Hai đến Chủ Nhật, 08:00-19:30</p>
```

Do not alter existing `0866 169 569` text or any `tel:0866169569` link.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="publishes one consistent local business identity" tests/page-contract.test.mjs
```

Expected: PASS and JSON parsing succeeds without exceptions.

- [ ] **Step 6: Run the full contract checkpoint**

Run:

```powershell
node --test tests/page-contract.test.mjs
```

Expected: all active tests pass.

### Task 3: robots.txt and sitemap.xml

**Files:**
- Modify: `tests/page-contract.test.mjs`
- Create: `robots.txt`
- Create: `sitemap.xml`

**Interfaces:**
- Consumes: canonical URL from Task 1.
- Produces: root crawl policy and canonical URL discovery documents.

- [ ] **Step 1: Write the failing crawl test**

Add to `tests/page-contract.test.mjs`:

```js
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
    /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*<url>\s*<loc>https:\/\/thienuy\.edu\.vn\/<\/loc>\s*<\/url>\s*<\/urlset>\s*$/s,
  );
  assert.doesNotMatch(sitemap, /<changefreq>|<priority>/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test --test-name-pattern="exposes crawl discovery files" tests/page-contract.test.mjs
```

Expected: FAIL in the named test with `ENOENT` for `robots.txt` or `sitemap.xml`, proving the files do not yet exist.

- [ ] **Step 3: Create robots.txt**

Create `robots.txt` with exactly:

```text
User-agent: *
Allow: /

Sitemap: https://thienuy.edu.vn/sitemap.xml
```

Include one final newline.

- [ ] **Step 4: Create sitemap.xml**

Create `sitemap.xml` with exactly:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thienuy.edu.vn/</loc>
  </url>
</urlset>
```

Include one final newline.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="exposes crawl discovery files" tests/page-contract.test.mjs
```

Expected: PASS.

- [ ] **Step 6: Run the full contract checkpoint**

Run:

```powershell
node --test tests/page-contract.test.mjs
```

Expected: all active tests pass.

### Task 4: Full regression and SEO consistency audit

**Files:**
- Verify: `index.html`
- Verify: `robots.txt`
- Verify: `sitemap.xml`
- Verify: `tests/page-contract.test.mjs`
- Verify: `tests/page-behavior.test.mjs`

**Interfaces:**
- Consumes: all outputs from Tasks 1-3.
- Produces: fresh evidence that the complete static site remains valid under its automated contracts.

- [ ] **Step 1: Run all automated tests**

Run:

```powershell
node --test
```

Expected: exit code `0`; all active contract and behavior tests pass; existing intentionally skipped legacy tests may remain skipped.

- [ ] **Step 2: Check production files for forbidden or conflicting signals**

Run:

```powershell
rg --line-number "1900 886866|noindex|http://thienuy\.edu\.vn|https://www\.thienuy\.edu\.vn|meta name=\"keywords\"" index.html robots.txt sitemap.xml
```

Expected: no matches and exit code `1`, which is `rg`'s normal result when nothing is found.

- [ ] **Step 3: Confirm every canonical reference**

Run:

```powershell
rg --line-number "https://thienuy\.edu\.vn/" index.html robots.txt sitemap.xml
```

Expected: matches for canonical, Open Graph URL/image, JSON-LD IDs/URLs/images, robots sitemap URL, and sitemap homepage URL; no `www` variant.

- [ ] **Step 4: Record the external Google handoff**

Report these required owner-account actions without claiming they were completed:

1. Verify `thienuy.edu.vn` in Google Search Console.
2. Submit `https://thienuy.edu.vn/sitemap.xml`.
3. Inspect `https://thienuy.edu.vn/` and request indexing.
4. Update Google Business Profile with the exact approved name, phone, address, hours, and website.
5. Keep Facebook business data consistent with the website.
