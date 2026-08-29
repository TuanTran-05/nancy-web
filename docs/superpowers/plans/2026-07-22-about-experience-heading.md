# About Experience Heading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the approved two-line “TỰ HÀO 10+ NĂM HOẠT ĐỘNG / GIẢNG DẠY TIẾNG ANH” trust heading beneath the About section title, matching the supplied reference while preserving every existing image.

**Architecture:** Keep the change local to the existing static About section. Add semantic HTML for the two heading lines, style the blue/orange typography and curved orange underline entirely in CSS, and protect the agreed structure and responsive rules with the existing Node contract tests. No JavaScript or image assets change.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- Preserve all existing image files and image references.
- Insert the new heading directly after “Về Nancy English Center” and before the current lead paragraph.
- Use the exact approved Vietnamese copy once in the About section.
- Keep the desktop presentation centered and visually two-line; allow safe wrapping on narrow screens without horizontal overflow.
- Do not modify JavaScript behavior.
- This workspace is not a Git repository, so commit checkpoints are not available.

---

### Task 1: Add and verify the About experience heading

**Files:**

- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Verify: `tests/page-behavior.test.mjs`

**Step 1: Write the failing contract test**

Add a test that scopes itself to the About section and verifies:

- the approved heading occurs exactly once;
- the primary lead, orange accent, and secondary line use their agreed classes and exact text;
- the orange accent has a CSS pseudo-element underline;
- the mobile breakpoint supplies a smaller responsive font size.

```js
test("about section includes the approved experience heading", () => {
  const aboutStart = html.indexOf('<section class="section about"');
  const aboutEnd = html.indexOf('<section class="section courses"');
  const about = html.slice(aboutStart, aboutEnd);

  assert.equal((about.match(/TỰ HÀO/g) ?? []).length, 1);
  assert.match(about, /class="experience-heading"/);
  assert.match(about, /<span class="experience-heading__lead">TỰ HÀO<\/span>/);
  assert.match(
    about,
    /<strong class="experience-heading__accent">10\+ NĂM HOẠT ĐỘNG<\/strong>/,
  );
  assert.match(
    about,
    /<p class="experience-heading__secondary">GIẢNG DẠY TIẾNG ANH<\/p>/,
  );
  assert.match(
    css,
    /\.experience-heading__accent::after\s*\{[^}]*border-top:\s*4px solid var\(--orange\)/s,
  );
  assert.match(
    css,
    /@media \(max-width: 580px\)[\s\S]*?\.experience-heading__primary,[\s\S]*?font-size:\s*clamp\(1\.45rem,\s*7\.2vw,\s*2\.1rem\)/s,
  );
});
```

**Step 2: Run the focused test to confirm RED**

Run: `node --test tests/page-contract.test.mjs`

Expected: FAIL because `.experience-heading` and its CSS do not exist yet.

**Step 3: Add the semantic heading markup**

In `index.html`, insert this block after the existing About `h2` and before `.section-lead`:

```html
<div
  class="experience-heading"
  aria-label="Tự hào 10+ năm hoạt động giảng dạy tiếng Anh"
>
  <p class="experience-heading__primary">
    <span class="experience-heading__lead">TỰ HÀO</span>
    <strong class="experience-heading__accent">10+ NĂM HOẠT ĐỘNG</strong>
  </p>
  <p class="experience-heading__secondary">GIẢNG DẠY TIẾNG ANH</p>
</div>
```

**Step 4: Add the desktop and mobile styles**

In `styles.css`, add local About-section styles for:

- centered Baloo 2 typography;
- blue lead and secondary line;
- orange accent text;
- a curved orange underline created with `.experience-heading__accent::after`;
- compact spacing to the lead paragraph;
- a `max-width: 580px` override using `clamp(1.45rem, 7.2vw, 2.1rem)`.

**Step 5: Run focused and full verification to confirm GREEN**

Run:

```powershell
node --test tests/page-contract.test.mjs
node --test tests/page-behavior.test.mjs tests/page-contract.test.mjs
node --check script.js
```

Expected: all tests pass and JavaScript syntax remains valid.

**Step 6: Perform a final scope check**

Confirm that only the planned HTML, CSS, test, spec, and plan files changed during this request, and that no image asset was edited.
