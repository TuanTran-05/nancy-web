import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../results-modal.js", import.meta.url), "utf8");

function loadModule() {
  const window = {};
  vm.runInNewContext(source, { window });
  return window.NancyResults;
}

const course = {
  label: "KET",
  cefr: "A2",
  grade: "Lớp 6-7",
  org: "Cambridge English",
  shape: "portrait",
  stats: { total: 19, highest: "143", range: "A2-B1" },
  items: [
    { src: "images/results/ket/01.jpg", caption: "Pass · Grade B", meta: "136 · A2" },
    { src: "images/results/ket/02.jpg", caption: "Pass · Grade A", meta: "143 · B1" },
    { src: "images/results/ket/03.jpg", caption: "", meta: "" },
  ],
};

test("escapes characters that would break out of markup", () => {
  const { escapeHtml } = loadModule();
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("Nguyễn & Trần"), "Nguyễn &amp; Trần");
  assert.equal(escapeHtml(undefined), "");
});

test("stats strip shows the three populated figures", () => {
  const html = loadModule().renderStats(course);
  assert.match(html, /19/);
  assert.match(html, /143/);
  assert.match(html, /A2-B1/);
  assert.match(html, /học viên/);
});

test("stats strip omits figures that were left empty", () => {
  const bare = { ...course, stats: { total: 8, highest: "", range: "" } };
  const html = loadModule().renderStats(bare);
  assert.match(html, /8/);
  assert.equal(html.includes("Điểm cao nhất"), false);
  assert.equal(html.includes("Trình độ đạt"), false);
});

test("grid renders one lazy-loaded tile per item, indexed in order", () => {
  const html = loadModule().renderGrid(course);
  assert.equal((html.match(/data-action="zoom"/g) || []).length, 3);
  assert.match(html, /data-index="0"/);
  assert.match(html, /data-index="2"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /images\/results\/ket\/01\.jpg/);
});

test("grid tiles carry captions, and stay silent when the score was unreadable", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /Pass · Grade B/);
  assert.match(html, /136 · A2/);
  assert.equal((html.match(/results-tile__cap/g) || []).length, 2);
});

test("grid carries the shape so CSS can pick a column count", () => {
  const portrait = loadModule().renderGrid(course);
  const landscape = loadModule().renderGrid({ ...course, shape: "landscape" });
  assert.match(portrait, /data-shape="portrait"/);
  assert.match(landscape, /data-shape="landscape"/);
});

test("detail view shows a counter and the current image", () => {
  const html = loadModule().renderDetail(course, 1);
  assert.match(html, /2\s*\/\s*3/);
  assert.match(html, /images\/results\/ket\/02\.jpg/);
  assert.match(html, /Pass · Grade A/);
});

test("detail view keeps prev and next available so navigation can wrap", () => {
  const first = loadModule().renderDetail(course, 0);
  assert.match(first, /data-action="prev"/);
  assert.match(first, /data-action="next"/);
});

test("alt text describes the document without naming a student", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /alt="Phiếu điểm KET của học viên Nancy English Center"/);
  assert.equal(/alt="[^"]*(Nguyen|Nguyễn|Dinh|Đinh)/.test(html), false);
});
