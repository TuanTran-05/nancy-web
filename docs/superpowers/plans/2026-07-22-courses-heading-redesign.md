# Courses Heading Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the courses section heading to match the supplied reference image.

**Architecture:** This is a static HTML/CSS change. The courses section keeps the same ID, intro copy, carousel markup, and JavaScript behavior; only the heading markup and its dedicated CSS are changed.

**Tech Stack:** Static HTML, CSS, existing responsive stylesheet.

## Global Constraints

Only the courses section heading is changed.

Use the text `KHÓA HỌC DÀNH CHO MỌI ĐỘ TUỔI`.

The heading must use large uppercase dark blue text plus an orange rounded capsule for `MỌI ĐỘ TUỔI`.

The heading must not overflow on mobile.

---

### Task 1: Courses Heading Treatment

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: Existing `#courses-heading`, `.courses`, `.section-title`, and CSS color variables.
- Produces: New heading classes `.courses-heading`, `.courses-heading__lead`, `.courses-heading__pill`, and `.courses-heading__spark`.

- [ ] **Step 1: Update heading markup**

Replace the current courses `<h2>` with:

```html
<h2 class="section-title courses-heading" id="courses-heading">
  <span class="courses-heading__lead">KHÓA HỌC DÀNH CHO</span>
  <span class="courses-heading__pill">
    MỌI ĐỘ TUỔI
    <span class="courses-heading__spark" aria-hidden="true"></span>
  </span>
</h2>
```

- [ ] **Step 2: Add dedicated CSS**

Add CSS under the courses section styles for the heading layout, capsule, and decorative spark. The CSS uses existing brand colors and responsive wrapping.

- [ ] **Step 3: Verify static render**

Open `index.html` in a browser or run a static server. Confirm the heading matches the reference at desktop width and wraps cleanly on narrow mobile width.
