import {
  computeDefaultTarget,
  parseTargetFromQS,
  formatWhen,
  tzInfo,
  startTicker
} from "./countdown.js";
import { createScenery } from "./scenery.js";
import { initHug } from "./hug.js";

const qs = new URLSearchParams(location.search);

// ---- Label / title ----
const defaultLabel = "Until I see Vered again 💙";
const label = qs.get("label") || defaultLabel;
document.title = (label || "").replace("💙", "").trim() || "vered.exe";
document.getElementById("label").textContent = label;

// ---- Target time (prefer QS, otherwise today 20:00 if before; else tomorrow 20:00) ----
function targetTodayAt(hour = 20, minute = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
}
function sameYMD(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

let target = parseTargetFromQS(qs) || computeDefaultTarget(20, 0);

// Safety guard in case countdown.js isn't updated on your host yet:
(() => {
  const now = new Date();
  // If no explicit ?time and it's still before 20:00 -> force today 20:00
  if (!qs.get("time")) {
    const tToday = targetTodayAt(20, 0);
    if (now < tToday) target = tToday;
  }
  // If target accidentally ended up behind "now", bump to tomorrow 20:00
  if (target <= now) {
    const tToday = targetTodayAt(20, 0);
    if (now < tToday) target = tToday; // still today
    else target = new Date(tToday.getTime() + 24 * 3600 * 1000); // tomorrow
  }
})();

// ---- Friendly "when" text ----
(function setWhen() {
  const now = new Date();
  const whenEl = document.getElementById("whenText");
  if (sameYMD(now, target)) {
    // Same-day wording
    const hh = String(target.getHours()).padStart(2, "0");
    const mm = String(target.getMinutes()).padStart(2, "0");
    whenEl.textContent = `Today at ${hh}:${mm}`;
  } else {
    whenEl.textContent = formatWhen(target);
  }
})();

// ---- TZ info ----
(() => {
  const { tz, offset } = tzInfo(target);
  document.getElementById("tzInfo").textContent = `${tz} • ${offset}`;
})();

// ---- Ticker ----
const $ = (id) => document.getElementById(id);
startTicker(
  target,
  ({ d, h, m, s }) => {
    $("d").textContent = d;
    $("h").textContent = String(h).padStart(2, "0");
    $("m").textContent = String(m).padStart(2, "0");
    $("s").textContent = String(s).padStart(2, "0");
  },
  () => {
    $("whenText").innerHTML = '<span style="color:#c9ffd8;font-weight:800">It’s time ✨</span>';
  }
);

// ---- Scenery ----
createScenery(document.getElementById("scene"));

// ---- Share / copy (local ISO so no UTC shift) ----
function toLocalISO(dt) {
  const pad = (n) => String(n).padStart(2, "0");
  const y = dt.getFullYear(),
    m = pad(dt.getMonth() + 1),
    d = pad(dt.getDate());
  const hh = pad(dt.getHours()),
    mm = pad(dt.getMinutes()),
    ss = pad(dt.getSeconds());
  const off = -dt.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const oh = pad(Math.floor(Math.abs(off) / 60));
  const om = pad(Math.abs(off) % 60);
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}${sign}${oh}:${om}`;
}

const shareUrl =
  location.origin +
  location.pathname +
  `?time=${encodeURIComponent(toLocalISO(target))}` +
  `&label=${encodeURIComponent(label)}`;

const shareBtn = document.getElementById("share");
shareBtn.href = shareUrl;
shareBtn.addEventListener("click", (e) => {
  if (navigator.share) {
    e.preventDefault();
    navigator.share({ title: document.title || "vered.exe", url: shareUrl });
  }
});

document.getElementById("copy").addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard?.writeText(shareUrl).then(() => {
    e.currentTarget.textContent = "Copied ✔";
    setTimeout(() => (e.currentTarget.textContent = "Copy link"), 1500);
  });
});

// ---- Hug overlay ----
initHug();
