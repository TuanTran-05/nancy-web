# Course Image Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Put the supplied IELTS results photo in the IELTS course card and move the former IELTS student photo to the university exam preparation card.

**Architecture:** Keep the existing static HTML course-card structure and image styling unchanged. Protect the two source assignments with the existing Node page-contract test suite.

**Tech Stack:** Static HTML, Node.js built-in test runner

## Global Constraints

- Preserve card markup, dimensions, lazy loading, decoding, styling, and course copy.
- Use `images/IMG_20260803_165233.jpg` for IELTS.
- Use `https://i.postimg.cc/ZRrpDX67/748741212-1553232193481313-2232384107086123280-n.jpg` for Luyện thi đại học.

---

### Task 1: Protect and implement the image reassignment

**Files:**
- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html`

**Interfaces:**
- Consumes: course cards selected by `article.course-card[data-course="ielts"]` and `article.course-card[data-course="dai-hoc"]`
- Produces: stable image-source and accessible-alt-text contracts for both cards

- [ ] **Step 1: Write the failing test**

Add a Node test that extracts each course article and asserts the exact new `src`, a meaningful `alt`, and the local image's existence.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/page-contract.test.mjs --test-name-pattern="course images"`

Expected: FAIL because IELTS still uses the old URL and the university card still uses `images/course-ielts.jpg`.

- [ ] **Step 3: Write minimal implementation**

Change only the `src` and `alt` attributes of the IELTS and `dai-hoc` images in `index.html`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/page-contract.test.mjs`

Expected: all tests pass with zero failures.

- [ ] **Step 5: Review the diff**

Run: `git diff -- index.html tests/page-contract.test.mjs`

Expected: only the two image contracts and their matching HTML attributes have changed.
