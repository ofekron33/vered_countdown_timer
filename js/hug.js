export function initHug() {
  const overlay = document.getElementById("hugOverlay");
  const scene = document.getElementById("hugScene");
  const closeBtn = document.getElementById("hugClose");
  const btn = document.getElementById("hugBtn");

  function open() {
    overlay.classList.add("show");
    // let slide-in happen, then pulse & sparkles
    setTimeout(() => overlay.classList.add("animate"), 900);
    // auto-close after a few seconds
    autoTimer = setTimeout(close, 5200);
  }

  function close() {
    overlay.classList.remove("animate");
    overlay.classList.remove("show");
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
  }

  let autoTimer = null;

  btn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  return { open, close };
}
