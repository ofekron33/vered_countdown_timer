export function initHug() {
  const overlay = document.getElementById("hugOverlay");
  const closeBtn = document.getElementById("hugClose");
  const btn = document.getElementById("hugBtn");
  const container = document.getElementById("lottieHug");

  let anim = null;
  let autoTimer = null;

  function ensureAnimation() {
    if (anim) return anim;
    if (!window.lottie) return null;
    anim = window.lottie.loadAnimation({
      container,
      renderer: "svg",
      loop: true,
      autoplay: false,
      path: "./assets/hug.json"  // <-- your downloaded Lottie JSON
    });
    // Optional: slow it slightly for tenderness
    anim.setSpeed(0.9);
    return anim;
  }

  function open() {
    overlay.classList.add("show");
    const a = ensureAnimation();
    // allow CSS fade-in first for a polished feel
    setTimeout(() => {
      overlay.classList.add("animate");
      a && a.goToAndPlay(0, true);
    }, 300);
    // auto-close after a few seconds (optional)
    autoTimer = setTimeout(close, 5200);
  }

  function close() {
    overlay.classList.remove("animate");
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (anim) { anim.stop(); }
    // Let the fade-out complete before hiding; prevents flicker on next open
    setTimeout(() => overlay.classList.remove("show"), 180);
  }

  btn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  // If Lottie fails to load, show a tiny fallback text
  if (!window.lottie) {
    container.textContent = "🤗";
    container.style.fontSize = "72px";
  }

  return { open, close };
}
