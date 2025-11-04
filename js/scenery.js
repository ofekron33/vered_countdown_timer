export function createScenery(canvas) {
  const ctx = canvas.getContext("2d");
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let W, H, t = 0;

  function resize() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  addEventListener("resize", resize, { passive: true });

  const stars = new Array(140).fill(0).map(() => ({
    x: Math.random() * W, y: Math.random() * H,
    r: Math.random() * 1.5 + 0.2, a: Math.random() * 0.5 + 0.2, s: Math.random() * 0.4 + 0.1
  }));

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0e2450"); g.addColorStop(1, "#071225");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const r1 = ctx.createRadialGradient(W*0.78,H*0.12,0, W*0.78,H*0.12, Math.max(W,H)*0.6);
    r1.addColorStop(0,"rgba(21,58,122,0.65)"); r1.addColorStop(1,"transparent");
    ctx.fillStyle = r1; ctx.fillRect(0,0,W,H);
    const r2 = ctx.createRadialGradient(W*0.18,H*0.88,0, W*0.18,H*0.88, Math.max(W,H)*0.55);
    r2.addColorStop(0,"rgba(18,42,87,0.55)"); r2.addColorStop(1,"transparent");
    ctx.fillStyle = r2; ctx.fillRect(0,0,W,H);
  }

  function drawStars(dt) {
    for (const s of stars) {
      s.x += s.s * dt * 0.02; s.y -= s.s * dt * 0.02;
      if (s.x > W + 5) s.x = -5; if (s.y < -5) s.y = H + 5;
      ctx.globalAlpha = s.a; ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawBeams() {
    ctx.save(); ctx.globalCompositeOperation="lighter";
    ctx.globalAlpha = 0.35 + 0.08*Math.sin(t*0.0012);
    const beams = [
      {x0: W*0.25, x1: W*0.42, w: W*0.08},
      {x0: W*0.55, x1: W*0.72, w: W*0.07},
      {x0: W*0.75, x1: W*0.92, w: W*0.06},
    ];
    for (const b of beams) {
      const grad = ctx.createLinearGradient(b.x0, H*0.74, b.x1, H*0.62);
      grad.addColorStop(0, "rgba(142,197,255,0)");
      grad.addColorStop(0.55, "rgba(142,197,255,0.6)");
      grad.addColorStop(1, "rgba(142,197,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(b.x0, H*0.9);
      ctx.lineTo(b.x0 + b.w, H*0.74);
      ctx.lineTo(b.x1, H*0.62);
      ctx.lineTo(b.x1 - b.w, H*0.9);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawMountains() {
    ctx.save(); ctx.fillStyle = "#0c1a33"; ctx.globalAlpha = 0.45;
    ctx.beginPath();
    const y0 = H*0.34; ctx.moveTo(0, y0 + 40);
    const peaks = [[W*0.05,y0+20],[W*0.18,y0-10],[W*0.33,y0+15],[W*0.55,y0-5],[W*0.78,y0+10],[W*0.95,y0]];
    for (const [x,y] of peaks) ctx.lineTo(x,y);
    ctx.lineTo(W, y0 + 60); ctx.lineTo(W, 0); ctx.lineTo(0,0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawWaves(dt) {
    const baseY = H * 0.78;
    const layers = [
      {amp: 14, len: 320, speed: 0.06, alpha: 0.85, color: "#123a6e"},
      {amp: 11, len: 420, speed: 0.04, alpha: 0.6,  color: "#0e2f59"},
      {amp: 9,  len: 540, speed: 0.03, alpha: 0.38, color: "#0a2342"},
    ];
    for (let i=0;i<layers.length;i++){
      const L = layers[i]; ctx.save(); ctx.globalAlpha = L.alpha; ctx.fillStyle = L.color;
      ctx.beginPath(); ctx.moveTo(0, H);
      for (let x=0; x<=W+2; x+=2){
        const y = baseY + Math.sin((x + t*L.speed*120) / L.len * Math.PI*2) * L.amp + i*12;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }

  function drawPlane() {
    const pathY = H*0.12 + Math.sin(t*0.0015)*6;
    const pathX = (t*0.06) % (W + 200) - 100;
    ctx.save(); ctx.translate(pathX, pathY); ctx.rotate(0.05);
    ctx.fillStyle = "#eaf4ff"; ctx.shadowColor="#bfe0ff"; ctx.shadowBlur=14;
    ctx.beginPath();
    ctx.moveTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(50, 6); ctx.lineTo(20, 12); ctx.lineTo(-20, 12);
    ctx.quadraticCurveTo(-5, 6, -20, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  let last = performance.now();
  function frame(now) {
    const dt = now - last; last = now; t += dt;
    drawSky(); drawStars(dt); drawBeams(); drawMountains(); drawWaves(dt); drawPlane();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return { resize };
}
