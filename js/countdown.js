export function computeDefaultTarget() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 0, 0, 0);
}

export function parseTargetFromQS(qs) {
  const raw = qs.get("time");
  if (!raw) return null;
  const normalized = raw.includes(" ") ? raw.replace(" ", "T") : raw;
  const tryISO = new Date(normalized);
  if (!isNaN(tryISO)) return tryISO;
  const m = normalized.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6] : 0, 0);
  return null;
}

export function formatWhen(target) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" }).format(target);
}

export function tzInfo(target) {
  const offMin = -target.getTimezoneOffset();
  const sign = offMin >= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(offMin) / 60)).padStart(2, "0");
  const mm = String(Math.abs(offMin) % 60).padStart(2, "0");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";
  return { tz, offset: `UTC${sign}${hh}:${mm}` };
}

export function startTicker(target, onTick, onDone) {
  function tick() {
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff = 0;
    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / 60000) % 60;
    const h = Math.floor(diff / 3600000) % 24;
    const d = Math.floor(diff / 86400000);
    onTick({ d, h, m, s, diff });
    if (diff === 0) {
      clearInterval(timer);
      onDone?.();
    }
  }
  const timer = setInterval(tick, 250);
  tick();
  return () => clearInterval(timer);
}
