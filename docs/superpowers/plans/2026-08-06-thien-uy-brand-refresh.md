# Thien Uy Brand Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visible Nancy brand and old logo with Thien Uy English Center while preserving Nancy as a searchable legacy identity.

**Architecture:** Keep the site static and reuse the existing local `images/logo.png` path so both header and footer receive the new asset without markup duplication. Update only brand-level HTML and SEO identity fields; leave descriptive Nancy copy, contact details, Facebook URL, map, course content, and result captions unchanged.

**Tech Stack:** Static HTML/CSS, PNG assets, Node.js built-in test runner.

## Global Constraints

- The visible brand name is exactly `THIEN UY ENGLISH CENTER`.
- The primary machine-readable name is exactly `Thien Uy English Center`.
- `Nancy English Center` and `Anh Ngữ Nancy An Phú` remain legacy/alternate names for search discovery.
- Existing descriptive copy that mentions Nancy English Center stays unchanged.
- Contact details, Facebook, map, domain, course content, student-result content, and layout stay unchanged.
- The supplied logo is stored locally at `images/logo.png`; the live page must not depend on Postimg.

---

## File Map

- `index.html`: owns page title, Open Graph metadata, JSON-LD business identity, visible header/footer branding, accessibility labels, and copyright text.
- `images/logo.png`: shared local logo asset consumed by the header, footer, Open Graph image, and JSON-LD identity.
- `tests/page-contract.test.mjs`: protects the dual-brand SEO contract, visible Thien Uy labels, preserved Nancy description, and exact approved logo asset.

### Task 1: Protect the approved dual-brand and logo contract

**Files:**
- Modify: `tests/page-contract.test.mjs:1-115`
- Modify: `tests/page-contract.test.mjs:150-175`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: UTF-8 `html` loaded from `index.html` and binary `images/logo.png` loaded with `readFile()`.
- Produces: regression contracts for primary name `Thien Uy English Center`, legacy names `Nancy English Center` and `Anh Ngữ Nancy An Phú`, visible uppercase name, unchanged Nancy description, and SHA-256 logo hash `c36ba0ebd583f90c31f86726776e69647dadd61548edb1469d47038614a8c640`.

- [ ] **Step 1: Add the failing brand and asset expectations**

Add the crypto import and load the logo as a buffer:

```js
import { createHash } from "node:crypto";

const logo = await readFile(new URL("../images/logo.png", import.meta.url));
```

Rename the SEO test to `publishes the Thien Uy identity while preserving Nancy discovery` and update its exact title/Open Graph expectations:

```js
assert.match(
  html,
  /<title>\s*Thien Uy English Center \| Nancy English Center\s*<\/title>/,
);
assert.match(
  html,
  /<meta\s+name="description"\s+content="Nancy English Center - Anh Ngữ Nancy An Phú,[^"]+0866 169 569\."\s*\/>/s,
);

const expectedOpenGraph = new Map([
  ["og:type", "website"],
  ["og:locale", "vi_VN"],
  ["og:site_name", "Thien Uy English Center"],
  ["og:title", "Thien Uy English Center | Nancy English Center"],
  ["og:url", "https://thienuy.edu.vn/"],
  ["og:image", "https://thienuy.edu.vn/images/logo.png"],
]);
```

Update the JSON-LD expectations:

```js
assert.deepEqual(website, {
  "@type": "WebSite",
  "@id": "https://thienuy.edu.vn/#website",
  url: "https://thienuy.edu.vn/",
  name: "Thien Uy English Center",
  alternateName: ["Nancy English Center", "Anh Ngữ Nancy An Phú"],
  inLanguage: "vi-VN",
});
assert.equal(business.name, "Thien Uy English Center");
assert.deepEqual(business.alternateName, [
  "Nancy English Center",
  "Anh Ngữ Nancy An Phú",
]);
```

Update the header/footer brand contract and add the exact asset hash:

```js
const brand = html.match(/<a\s+class="brand"[\s\S]*?<\/a>/)?.[0] ?? "";
assert.match(brand, /aria-label="Thien Uy English Center - Trang chủ"/);
assert.match(brand, /<strong>THIEN UY ENGLISH CENTER<\/strong>/);
assert.match(brand, /<em>thienuy\.edu\.vn<\/em>/);
assert.match(html, /<span class="foot-name">THIEN UY ENGLISH CENTER<\/span>/);
assert.match(html, /© 2025 Thien Uy English Center\. All rights reserved\./);

assert.equal(
  createHash("sha256").update(logo).digest("hex"),
  "c36ba0ebd583f90c31f86726776e69647dadd61548edb1469d47038614a8c640",
);
```

- [ ] **Step 2: Run the focused contract tests and confirm the old identity fails**

Run:

```powershell
node --test --test-name-pattern="Thien Uy identity|navigation landmarks" tests/page-contract.test.mjs
```

Expected: FAIL because `index.html` still uses Nancy as its primary/visible name and `images/logo.png` still has SHA-256 `81e63f17a36e273de9ca97ba8efbb53bc3f9b22ae7208dac5d0aebaa5360b6b0`.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- tests/page-contract.test.mjs
git commit -m "test: define Thien Uy dual-brand contract"
```

### Task 2: Apply the Thien Uy identity and approved logo

**Files:**
- Modify: `index.html:6-47`
- Modify: `index.html:172-188`
- Modify: `index.html:1477-1550`
- Replace: `images/logo.png`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: the exact brand strings and SHA-256 asset contract created in Task 1.
- Produces: a static page that exposes Thien Uy as the primary brand while retaining Nancy and Anh Ngữ Nancy An Phú as legacy discovery terms.

- [ ] **Step 1: Update title, Open Graph, and JSON-LD identity**

Apply these exact identity values in `index.html`:

```html
<title>Thien Uy English Center | Nancy English Center</title>
<meta property="og:site_name" content="Thien Uy English Center" />
<meta
  property="og:title"
  content="Thien Uy English Center | Nancy English Center"
/>
```

Keep both description tags unchanged. In the `WebSite` and organization JSON-LD nodes, set:

```json
"name": "Thien Uy English Center",
"alternateName": ["Nancy English Center", "Anh Ngữ Nancy An Phú"]
```

- [ ] **Step 2: Update the visible and accessible brand labels**

Change only brand-level labels in `index.html`:

```html
aria-label="Thien Uy English Center - Trang chủ"
<strong>THIEN UY ENGLISH CENTER</strong>
<span class="foot-name">THIEN UY ENGLISH CENTER</span>
aria-label="Facebook của Thien Uy English Center"
aria-label="Zalo của Thien Uy English Center"
© 2025 Thien Uy English Center. All rights reserved.
```

Do not alter narrative paragraphs, image descriptions, the results modal, Facebook URL, map query/title, contact details, or course content.

- [ ] **Step 3: Replace the shared local logo with the approved PNG**

Download to a temporary file, verify it, then replace the repository asset:

```powershell
Invoke-WebRequest -Uri 'https://i.postimg.cc/5NPyBH5z/8f924ba5-ebef-4ae7-837e-808057d68243.png' -OutFile 'C:\tmp\thien-uy-logo.png'
(Get-FileHash 'C:\tmp\thien-uy-logo.png' -Algorithm SHA256).Hash
Copy-Item -LiteralPath 'C:\tmp\thien-uy-logo.png' -Destination 'D:\Nancy\Web\images\logo.png' -Force
```

Expected hash before copying: `C36BA0EBD583F90C31F86726776E69647DADD61548EDB1469D47038614A8C640`. The source is an 800×800 PNG, so the existing square header/footer layout can remain unchanged.

- [ ] **Step 4: Run the focused tests and confirm the new contract passes**

Run:

```powershell
node --test --test-name-pattern="Thien Uy identity|navigation landmarks" tests/page-contract.test.mjs
```

Expected: PASS with zero failures.

- [ ] **Step 5: Run the complete test suite**

Run:

```powershell
node --test tests/*.mjs
```

Expected: all tests pass with zero failures.

- [ ] **Step 6: Verify scope and render the page at desktop and mobile widths**

Run:

```powershell
git diff --check
git diff -- index.html images/logo.png tests/page-contract.test.mjs
```

Confirm that CSS remains unchanged unless the 800×800 logo is visibly clipped or distorted. Inspect the header and footer at a desktop width and a mobile width; both must show the complete logo and the text `THIEN UY ENGLISH CENTER` without overlap.

- [ ] **Step 7: Commit the implementation**

```powershell
git add -- index.html images/logo.png
git commit -m "feat: refresh site branding for Thien Uy"
```
