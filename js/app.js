import { computeDefaultTarget, parseTargetFromQS, formatWhen, tzInfo, startTicker } from "./countdown.js";
import { createScenery } from "./scenery.js";
import { initHug } from "./hug.js";

const qs = new URLSearchParams(location.search);
const label = qs.get("label") || "Until I see Vered again 💙";
document.title = label.replace("💙","").trim();
document.getElementById("label").textContent = label;

let target = parseTargetFromQS(qs) || computeDefaultTarget();

document.getElementById("whenText").textContent = formatWhen(target);
const { tz, offset } = tzInfo(target);
document.getElementById("tzInfo").textContent = `${tz} • ${offset}`;

const $ = id => document.getElementById(id);
startTicker(target, ({d,h,m,s}) => {
  $("d").textContent = d;
  $("h").textContent = String(h).padStart(2,"0");
  $("m").textContent = String(m).padStart(2,"0");
  $("s").textContent = String(s).padStart(2,"0");
}, () => {
  document.getElementById("whenText").innerHTML = '<span style="color:#c9ffd8;font-weight:800">It’s time ✨</span>';
});

// Scenery
const canvas = document.getElementById("scene");
createScenery(canvas);

// Share / copy
const offMin = -target.getTimezoneOffset();
const sign = offMin>=0?"+":"-";
const hh = String(Math.floor(Math.abs(offMin)/60)).padStart(2,"0");
const mm = String(Math.abs(offMin)%60).padStart(2,"0");
const shareUrl = location.origin + location.pathname +
  `?time=${encodeURIComponent(target.toISOString().slice(0,19))}%2B${hh}:${mm}` +
  `&label=${encodeURIComponent(label)}`;

const shareBtn = document.getElementById("share");
shareBtn.href = shareUrl;
shareBtn.addEventListener("click", (e) => {
  if (navigator.share) {
    e.preventDefault();
    navigator.share({ title: label, url: shareUrl });
  }
});
document.getElementById("copy").addEventListener("click", (e) => {
  e.preventDefault();
  navigator.clipboard?.writeText(shareUrl).then(() => {
    e.currentTarget.textContent = "Copied ✔";
    setTimeout(() => e.currentTarget.textContent = "Copy link", 1500);
  });
});

// Hug
initHug();
