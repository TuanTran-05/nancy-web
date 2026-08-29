# Prompt redesign landing page — Nancy English Center

> **Cách dùng:** copy toàn bộ phần trong khung `=== PROMPT START ===` … `=== PROMPT END ===`
> rồi dán vào Claude / ChatGPT / v0 / Lovable / Cursor. Nếu công cụ không đọc được file
> trong repo, đính kèm thêm `index.html`, `styles.css`, `script.js`.
>
> Prompt đã khoá sẵn: giữ toàn bộ nội dung tiếng Việt, giữ 7 tính năng JS, giữ thứ tự
> 9 section, giữ hero, giữ xanh #0E4EA1, cho phép tinh chỉnh cam, cho phép đổi bố cục
> bên trong từng section.

---

=== PROMPT START ===

# ROLE

You are a senior front-end designer and developer specialising in high-converting,
accessible marketing sites for education businesses. You are redesigning the visual
layer of a live Vietnamese landing page. This is a **redesign of an existing,
working product** — not a greenfield build. Every existing feature and every word of
existing copy must survive the redesign intact.

# PROJECT

**Nancy English Center / Anh Ngữ Nancy An Phú** (`https://thienuy.edu.vn`) — an English
language centre in An Phú ward, Ho Chi Minh City, Vietnam. It teaches children and teens
from grade 2 and below up to grade 10+, including Cambridge exam prep (Movers, Flyers,
KET, PET) and IELTS.

**Audience:** Vietnamese parents, roughly 30–45 years old, mostly browsing on a phone,
often over a mobile connection. They are choosing where to send their child. The page
must make them feel the centre is established, careful with children, and easy to reach
by phone or Zalo.

**Primary conversion goals, in order:**
1. Tap the hotline `0866 169 569` (a `tel:` link)
2. Submit the free placement-test registration form
3. Message on Zalo

Every design decision should be judged against: *does this make a parent more likely to
call, or to fill in the form?*

# TECH STACK — HARD CONSTRAINTS

This is a hand-written static site deployed by uploading files. Do not change this.

- **Exactly three files:** `index.html`, `styles.css`, `script.js`. No new files.
- **No build step, no npm, no bundler, no package.json.** Nothing that requires compiling.
- **No frameworks and no libraries.** No React, Vue, Tailwind, Bootstrap, jQuery, GSAP,
  AOS, Swiper, Alpine. Vanilla HTML + CSS + ES5-compatible JavaScript only.
- **No CDN links, no external `<script>` or `<link>` to third-party hosts.** Fonts are
  self-hosted in `fonts/` and must stay that way (see FONTS below).
- The page must work correctly when served with `python -m http.server` from the project
  root, with no server-side logic.
- Preserve the cache-busting query strings on asset links
  (`styles.css?v=…`, `script.js?v=…`) and bump the version value when you ship.

# ABSOLUTE RULE #1 — DO NOT BREAK THE JAVASCRIPT

`script.js` is working, tested production code. **Treat it as read-only.** You may
restructure the HTML freely, but the hooks below are the contract between the markup
and the script. If a hook disappears or is renamed, a feature silently dies.

If you believe a JS change is genuinely necessary, stop and say so explicitly in your
response instead of editing `script.js` quietly.

## The 7 features and the exact hooks each one needs

**1. Mobile menu toggle**
- `.nav-toggle` — the hamburger `<button>`, with `aria-expanded` and
  `aria-controls="main-nav"`
- `.main-nav` — the `<nav>`, `id="main-nav"`; JS toggles class `open` on it
- Every `<a>` inside `.main-nav` closes the menu on click
- Escape key closes the menu and returns focus to the toggle
- Your CSS must define both the closed and the `.main-nav.open` state

**2. Sticky header state**
- `.site-header` — JS injects an invisible sentinel at the top of `<body>` and toggles
  the class `is-stuck` on the header once the page scrolls past it
- Your CSS must style both `.site-header` and `.site-header.is-stuck` (e.g. shadow,
  compact height, background). Do not rely on a scroll listener; there is none.

**3. Gallery lightbox**
- `.gal` — each gallery `<figure>`, requires `tabindex="0"` and `role="button"` and an
  `aria-label`; must contain an `<img>` and a `<figcaption>`
- `#lightbox` — the modal container, `role="dialog"`, `aria-modal="true"`; JS toggles
  class `open` and the `aria-hidden` attribute
- `.lightbox-img`, `.lightbox-caption`, `.lightbox-close` must all exist inside it
- JS adds `lightbox-active` to `<body>` while open — use it to lock page scroll
- Your CSS must style `.lightbox` (hidden) and `.lightbox.open` (visible)

**4. Scroll reveal**
- `.reveal` — any element to animate in; JS adds `.is-in` when it enters the viewport
- `<html>` gets the class `js` inline in `<head>`; scope reveal styles to `.js .reveal`
  so content is never invisible if the script fails
- Stagger uses an inline custom property `style="--d: 120ms"` — keep this pattern and
  read `--d` as `transition-delay` in CSS
- ⚠️ **Never put a static `transform` on a `.reveal` element.** The reveal animation owns
  `transform`, and `.is-in` resets it to `none`, so any static transform vanishes after
  the element animates in. If you need a permanent offset or rotation, apply it to a
  wrapper or a child element instead.
- Respects `prefers-reduced-motion`: everything is shown immediately

**5. Proof-band count-up**
- `[data-count-to="10"]` and `[data-count-suffix="+"]` — JS animates the number when it
  scrolls into view
- The real final value must stay in the HTML as the element's text content (`10+`,
  `1000+`), never `0`, so a counter that is never scrolled to still shows the true figure

**6. Course carousels (there are two on the page)**
- `[data-course-carousel]` — the wrapper
- `[data-course-track]` — the horizontally scrollable track; needs `tabindex="0"` and an
  `aria-label`. **Your CSS must make this a real horizontal scroller**
  (`display: flex; overflow-x: auto;` plus scroll-snap if you like). The JS measures
  `scrollWidth`, `clientWidth`, `scrollLeft` and `offsetLeft` of `.course-card` elements.
- `[data-course-controls]` — the toolbar; ships with the `hidden` attribute and JS
  removes it. Do not delete the `hidden` attribute from the markup.
- `[data-course-prev]` / `[data-course-next]` — the two `<button>`s. JS sets `.disabled`
  on them at the ends of the track, so **you must style `:disabled` visibly.**
- `.course-card` — the card element; step distance is derived from the gap between the
  first two cards, so all cards must have equal width and equal spacing

**7. Registration form → Google Form**

This is the money path. Break it and enquiries stop arriving.

- `[data-reg-form]` on the `<form>`, plus `novalidate`
- `data-mode="google-form"` and `data-endpoint="…/formResponse"` — **copy both attribute
  values character for character from the current `index.html`.**
- Each input carries a `data-entry="entry.NNNNNNNN"` mapping to a Google Form question ID.
  **These IDs must be preserved exactly.** Copy them verbatim from the existing file:
  `name`, `phone`, `child`, `grade`, `note`. Do not invent, reformat or renumber them.
- Field `name` attributes must stay: `name`, `phone`, `child`, `grade`, `note`, `website`
- `.field` — wrapper around each label + control; JS toggles `.has-error` on it
- `.field-error` — the error `<p>` inside each `.field`, `hidden` by default, linked via
  `aria-describedby`. Style `.field.has-error` clearly (red border + visible message).
- `.field-hint`, `.field-optional`, `.field--full` — supporting classes, keep them
- `.field-trap` — the honeypot wrapper containing `input[name="website"]`.
  **Keep it, keep it `aria-hidden="true"` and `tabindex="-1"`, and keep it visually hidden
  without using `display:none`** (bots skip `display:none`). Off-screen positioning.
- `[data-form-status]` — the status `<p>`, `role="status"`, `aria-live="polite"`.
  JS sets a `data-tone` attribute of `success` or `error`, so style
  `[data-form-status][data-tone="success"]` and `[data-tone="error"]` distinctly.
- `button[type="submit"]` — JS swaps its label to "Đang gửi..." and sets `aria-busy="true"`
  while sending. Style `[aria-busy="true"]` so the pending state is visible.

# ABSOLUTE RULE #2 — DO NOT CHANGE THE COPY

Every Vietnamese string on the page is approved by the centre owner. **Reproduce all of
it verbatim, including diacritics, capitalisation and punctuation.** Do not translate,
paraphrase, shorten, "improve", or invent new marketing copy. Do not add testimonials,
prices, teacher names, statistics, awards or guarantees that are not already on the page.

Two blocks carry `NOTE:` HTML comments flagging content the owner still has to confirm
(the 4-step process in `#path`, and the FAQ answer about placement testing). **Keep those
comments in place.**

Alt text on images is also approved and, in several cases, deliberately worded because
the photo does not show what its filename suggests. **Copy every `alt` attribute exactly
as-is. Never rewrite alt text from the filename.**

# SECTION INVENTORY — keep all nine, in this order

The order of sections and their `id`s are fixed (the nav, the footer links and the
JSON-LD all point at them). **You may redesign the internal layout of each section
freely.**

| # | Section | `id` | Contains |
|---|---------|------|----------|
| 1 | Hero | — | H1, sub-paragraph, 4 bullet points with icons, 2 CTAs, photo, wave divider |
| 2 | Proof band | — | 4 stats: `10+` years · `1000+` students · `08:00-19:30` · `An Phú` |
| 3 | About | `#about` | H2, motto line, lead paragraph, 1 photo, 5 numbered pillars (01–05) |
| 4 | Courses | `#courses` | H2 + lead, **two** carousels: 7 age-path courses, then 4 exam/support courses |
| 5 | Path | `#path` | H2 + lead, 4 numbered steps |
| 6 | Activities | `#activities` | H2 + lead, 5-image gallery with lightbox |
| 7 | Register | `#register` | H2 + lead, photo, the registration form |
| 8 | FAQ | `#faq` | H2, 5 `<details>` accordion items (first one `open`) |
| 9 | Contact | `#contact` | H2, 4 contact cards, Call + Zalo buttons, Google Maps iframe |

Plus **header** (logo, 6 nav links, phone link, "Đăng ký học thử" button, hamburger) and
**footer** (brand + tagline + socials, quick-links nav, contact column, copyright bar).

Also keep: the `.skip-link` at the very top of `<body>`, and `<main id="main">`.

## The hero is the one section you must NOT restructure

The hero currently is: **copy on the left, student photo bleeding to the right screen
edge, blue wave SVG across the bottom of the photo.** The owner has twice reverted
attempts to change it. Refine it — typography, spacing, button styling, the bullet-point
icon treatment, the wave's shape — but **keep the two-column composition, keep the photo
bleeding off the right edge, and keep the wave.**

Technical note: `.hero-grid` deliberately does **not** use the `.wrap` container. It sets
its own `width: calc(100% - 72px); margin-right: 0;` so the image column can touch the
right edge of the viewport. Wrapping it in `.wrap` destroys that bleed. If you rewrite
this, reproduce the same effect some other way, and make sure it degrades to a single
stacked column on mobile.

# DESIGN DIRECTION

**Target feel: professional and trustworthy, with warm, cheerful accents.**

The structural foundation should read as a serious, well-run education business — clean
grid, confident typography, real photography doing the heavy lifting. The warmth comes
from restrained accents: generous corner radii, the orange accent used sparingly and
purposefully, and student photos that show real kids and real classrooms.

Not this: cartoon mascots, rainbow gradients, comic-style illustration, more than a
handful of emoji, or anything that reads as a children's game. Also not this: cold,
grey, enterprise-SaaS minimalism. The current page sits closer to the second failure mode
than the first — bring it warmer, but keep it credible.

## Colour — locked

```
--brand:        #0E4EA1   /* primary blue. FIXED — matches the logo and the physical
                             signage. Do not change this value. */
--brand-strong: #0B3F85   /* hover on blue fills */
--brand-tint:   #E4EEFA
--brand-wash:   #F2F7FD
--accent:       #C24C00   /* orange. You MAY retune this hue for more warmth. */
--accent-hover: #A84200
--accent-ink:   #B04500
```

- Blue `#0E4EA1` is immutable.
- The orange may be retuned for a livelier, warmer feel **provided that** white text on
  the orange fill still reaches a contrast ratio of at least 4.5:1, and orange text on
  a white surface also reaches 4.5:1. State the new hex values and their measured
  contrast ratios in your response.
- **One brand colour and one accent — that is all.** No teal, violet, pink or green
  accents. An earlier version of this site used five competing accents and read as a
  free template.
- **Light theme only.** There is no dark mode and none should be added. A children's
  English centre on a dark background loses all of its warmth. Do not add a
  `prefers-color-scheme: dark` block.

## Typography — locked families

Both families are self-hosted as `.woff2` in `fonts/` and preloaded in `<head>`. **Do not
swap them, do not add a third family, and do not reintroduce a Google Fonts `<link>`** —
that would reintroduce a render-blocking third-party request.

- **Be Vietnam Pro** — all body copy and most headings. Available weights: 400, 500, 600,
  700, 800.
- **Baloo 2** — reserved for the H1 and display numerals, where its rounded warmth is an
  asset rather than noise. Variable font covering weights 600–800.
- Both are split into `latin` and `vietnamese` files by `unicode-range`. Keep the
  `@font-face` block at the top of `styles.css` exactly as it is, and keep the matching
  `<link rel="preload">` tags in `<head>`.

Every heading must remain fully legible with Vietnamese diacritics — check that stacked
marks (ẫ, ệ, ỡ, ừ) are not clipped by a tight `line-height` on large display text.

## Spacing and rhythm

The most recent complaint from the owner was **"the whole page has too much empty
space."** Vertical section padding was cut from ~124px to
`--section-y: clamp(52px, 5.6vw, 92px)` in response.

- Do not exceed that section padding. Prefer tightening it further over loosening it.
- Where a two-column row has one short column and one tall column, make the short column
  stretch to match instead of leaving a gap below it.
- Keep the container at `--wrap: 1240px` with `--gutter: clamp(20px, 5vw, 56px)`.
- Density is a feature here: parents scanning on a phone should reach the phone number
  and the form quickly.

## Shape and elevation

- Radii: keep a small set and use it consistently — inputs, buttons, cards, pills.
  Currently `8px / 12px / 18px / 999px`. You may retune the values; do not add a
  sixth radius.
- **Shadows must be tinted with the brand hue, never pure black.**
  Current base: `rgba(11, 40, 79, …)`.

# ASSETS

## Local images in `images/`

`hero.jpg` · `logo.png` · `zalo-icon.png` · `about-program.jpg` · `about-teacher-1.jpg` ·
`about-teacher-2.jpg` · `course-starter.jpg` · `course-movers.jpg` · `course-flyers.jpg` ·
`course-ket.jpg` · `course-pet.jpg` · `course-ielts.jpg` · `course-happy-kids.jpg` ·
`g1.jpg`–`g5.jpg`

Several images are also hosted remotely on `i.postimg.cc`. **Keep every `src` exactly as
it appears in the current `index.html`** — local paths stay local, remote URLs stay
remote. Do not "helpfully" repoint a remote URL at a local file; the filenames do not
correspond.

**The image filenames are not reliable descriptions of their contents.** Some "class
photos" are actually awards-ceremony photos, one is stock photography, and two files are
byte-identical to each other. This is exactly why the existing alt text must be copied
rather than regenerated.

## Image markup requirements

- Keep the `width` and `height` attributes on every `<img>` — they reserve layout space
  and prevent cumulative layout shift.
- Note that `styles.css` sets `height: auto` on images specifically because those
  attributes would otherwise make height definite and silently cancel every
  `aspect-ratio` rule. Preserve that.
- Keep `loading="lazy"` and `decoding="async"` on below-the-fold images.
- Keep `fetchpriority="high"` and the `<link rel="preload">` on the hero image; it is the
  LCP element.

## Icons

All icons are inline SVG with `viewBox="0 0 24 24"` and `fill="currentColor"`, marked
`aria-hidden="true"`. Keep this approach — no icon font, no icon library. You may
redesign the icon container treatment (the coloured circles behind the hero bullets,
the contact-card badges) freely.

# SEO AND STRUCTURED DATA — preserve exactly

Copy the entire `<head>` metadata block across unchanged:

- `<html lang="vi">`
- `<title>Anh Ngữ Nancy An Phú | Nancy English Center</title>` and the meta description
- `<link rel="canonical" href="https://thienuy.edu.vn/">`
- All Open Graph tags (`og:type`, `og:locale`, `og:site_name`, `og:title`,
  `og:description`, `og:url`, `og:image`)
- `<meta name="theme-color" content="#0E4EA1">` — update only if the brand blue changes,
  which it must not
- **The full `application/ld+json` `@graph` block**, containing `WebSite`,
  `EducationalOrganization` + `LocalBusiness` (with `telephone`, `address`,
  `openingHoursSpecification`, `sameAs`), and `FAQPage` with 3 questions.
  Copy it byte for byte.
- The inline `<script>` in `<head>` that adds the `js` class to `<html>` must stay in
  `<head>`, before the stylesheet's reveal rules apply.

Heading hierarchy: exactly one `<h1>` (the hero title). Each section keeps its `<h2>`.
Sub-items use `<h3>`/`<h4>`. Do not skip levels. Keep every `aria-labelledby` on the
sections pointing at its heading's `id`.

# ACCESSIBILITY REQUIREMENTS

- WCAG 2.1 AA contrast on all text, including text over photographs and inside coloured
  buttons.
- Visible focus rings on every interactive element — links, buttons, inputs, the
  `.gal` figures, the carousel tracks and their arrow buttons. Never `outline: none`
  without a replacement.
- Touch targets at least 44×44px on mobile. The hotline link and both CTAs especially.
- Keyboard: the mobile menu, the lightbox, both carousels and the FAQ accordion must all
  be fully operable without a mouse. Escape closes the menu and the lightbox.
- Respect `prefers-reduced-motion: reduce` — no reveal animation, no count-up, no smooth
  scroll. The JS already checks this; make sure your CSS does too.
- Keep the `.skip-link` as the first focusable element, and make it visible on focus.
- Keep every existing `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-hidden`,
  `role`, `aria-live` and `aria-modal` attribute.

# RESPONSIVE REQUIREMENTS

Mobile is the majority of traffic. Design mobile-first and verify at these widths:

**360px · 390px · 768px · 1024px · 1440px · 1920px**

- No horizontal page scroll at any width. Wide content (the carousels) scrolls inside
  its own container, never the body.
- The header collapses to the hamburger below the tablet breakpoint; the hotline must
  stay reachable in one tap on mobile — do not bury the phone number inside the
  collapsed menu.
- The hero stacks to a single column on mobile without leaving the photo cropped
  awkwardly or the wave overlapping the text.
- The registration form is single-column on mobile with comfortably sized inputs
  (font-size ≥ 16px so iOS does not zoom on focus).
- The Google Maps iframe stays responsive and keeps its aspect ratio.

# PERFORMANCE BUDGET

- No new network requests beyond what the page already makes.
- `styles.css` should not grow substantially; the current file is ~45KB and much of it
  is the `@font-face` block. Consolidate rather than accumulate — if you replace a
  component's styling, delete the old rules rather than layering new ones on top.
- Animate only `transform` and `opacity`. No animating `width`, `height`, `top`, `left`,
  `box-shadow` or `filter` on scroll.
- No `backdrop-filter` on large surfaces — it is expensive on the mid-range Android
  devices much of this audience uses.
- Target: Lighthouse Performance ≥ 90 and Accessibility ≥ 95 on mobile.

# WHAT "GENERIC AI DESIGN" LOOKS LIKE — avoid all of it

- A purple-to-blue gradient hero with floating translucent blobs
- Three identical feature cards, each with a circular pastel icon, in a perfect 3-up row
- Glassmorphism panels layered over a blurred background photo
- Emoji standing in for real icons
- Uniform 24px padding on every card and 80px between every section, forever
- Text over a photo with no scrim, failing contrast
- A dark "premium" section wedged between two light ones for no reason
- Fake logos, fake testimonials, fake "trusted by" bars
- Centre-aligned everything

Instead: build a real hierarchy. Decide what a parent must see first, make that element
genuinely dominant, and let secondary content be visibly secondary. Vary the rhythm
between sections so scrolling feels composed rather than uniform.

# DELIVERABLES

1. **`index.html`** — complete, valid, no placeholders, no `<!-- TODO -->`, no truncation,
   no "…rest of sections unchanged". Output the entire file.
2. **`styles.css`** — complete. Keep the `@font-face` block intact at the top. Keep the
   design-system comment header and update it to describe what you actually built.
3. **`script.js`** — **unchanged.** Only touch it if you flagged a necessary change and
   explained it first.
4. A short written summary covering:
   - What changed per section, and the reasoning
   - The final colour values, with measured contrast ratios if you retuned the orange
   - Anything you deliberately left alone, and why
   - Any assumption you had to make

# ACCEPTANCE CHECKLIST — verify each before you finish

Functionality:
- [ ] Hamburger opens and closes the menu; links close it; Escape closes it
- [ ] `.site-header` visibly changes appearance once `is-stuck` is applied
- [ ] Clicking or pressing Enter on a gallery figure opens the lightbox with the right
      image and caption; Escape and the close button both close it; page scroll is locked
      while it is open
- [ ] Elements with `.reveal` animate in on scroll and stay visible afterwards;
      no `.reveal` element carries a static `transform`
- [ ] `10+` and `1000+` count up when the proof band scrolls into view
- [ ] Both carousels scroll horizontally; both arrow buttons work; both become visibly
      disabled at the ends of their track
- [ ] The form validates all four required fields, shows per-field errors, clears an
      error as soon as the parent edits that field, and rejects a malformed phone number
- [ ] All five `data-entry="entry.…"` values and the `data-endpoint` URL are byte-identical
      to the original
- [ ] The honeypot field is invisible to humans, not focusable, and not `display:none`
- [ ] The FAQ accordion opens and closes; the first item is open on load

Content and metadata:
- [ ] Every Vietnamese string is present and unmodified
- [ ] Every `alt` attribute is unmodified
- [ ] Both `NOTE:` HTML comments survive
- [ ] The JSON-LD block is unmodified and still validates
- [ ] All nine section `id`s exist and every nav and footer link resolves to one

Design and quality:
- [ ] Blue is still exactly `#0E4EA1`; there is exactly one accent colour
- [ ] No dark-mode block anywhere in the CSS
- [ ] No horizontal scroll at 360px, 390px, 768px, 1024px, 1440px, 1920px
- [ ] Every interactive element has a visible focus state
- [ ] The hotline is reachable in one tap on mobile
- [ ] Vietnamese diacritics are not clipped on any heading
- [ ] Section spacing has not grown; the page does not feel empty

# APPENDIX — exact form wiring

Reference values, in case you cannot read the original file. If you *can* read the
original `index.html`, copy from it and use this appendix only to double-check.

```html
<form
  class="reg-form"
  data-reg-form
  data-mode="google-form"
  data-endpoint="https://docs.google.com/forms/d/e/1FAIpQLScZ61EKmEnvKekNxQALbSdPsFqJ7B7WB7fUYYF63QL_F_7sKg/formResponse"
  novalidate
>
```

| Field | `name` | `data-entry` | Type | Required |
|-------|--------|--------------|------|----------|
| Họ và tên phụ huynh | `name` | `entry.380148302` | text | yes |
| Số điện thoại | `phone` | `entry.1988606558` | tel | yes |
| Tên của con | `child` | `entry.1215349974` | text | yes |
| Lớp của con | `grade` | `entry.1485252148` | select | yes |
| Ghi chú | `note` | `entry.153390468` | textarea | no |
| *(honeypot)* | `website` | *(none — never sent)* | text | no |

`grade` options, in order: `Chọn cấp lớp` (empty value) · `Lớp 2 trở xuống` · `Lớp 3` ·
`Lớp 4` · `Lớp 5` · `Lớp 6-7` · `Lớp 8-9` · `Lớp 10 trở lên`

Changing a question inside the Google Form regenerates its `entry.` ID and silently
breaks submission. That is why these values must be carried across untouched.

# APPENDIX — key contact details (must appear correctly on the page)

- Hotline: **0866 169 569** → `tel:0866169569`
- Email: **thienuy@gmail.com** → `mailto:thienuy@gmail.com`
- Address: **Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256**
- Hours: **Thứ Hai đến Chủ Nhật, 08:00–19:30**
- Zalo: `https://zalo.me/1175234011658712481` (`target="_blank" rel="noopener"`)
- Facebook: `https://www.facebook.com/anhngunancyanphu?locale=vi_VN`
- Google Maps directions: `https://maps.app.goo.gl/Gme3adX9ZEsUhnwYA`

=== PROMPT END ===
