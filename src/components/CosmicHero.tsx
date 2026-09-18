"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CosmicHero — animated recreation of the reference artwork:
 * a black planet with a bright lens-flare star on its rim, swirling ring
 * lines that continuously orbit it, red nebula streaks drifting across a
 * twinkling starfield.
 *
 * Implementation: a single Canvas 2D scene (no WebGL dependency) tuned for
 * 60fps — nebulae are pre-rendered to offscreen sprites, ring geometry is
 * precomputed, and the loop pauses when the hero is off-screen or the tab
 * is hidden.
 *
 * Motion preference — three states:
 *   1. Default: follows the operating system's "reduce motion" setting.
 *   2. Motion off: the SAME scene is still drawn, but as a single frozen
 *      frame. No movement at all, yet the visitor still sees the real
 *      artwork, correctly composed for their screen shape.
 *   3. The visitor can override either way with the toggle in the corner,
 *      and the choice is remembered in their browser.
 *
 * The <img> fallback is now only for the split second before the canvas
 * paints, and for visitors with JavaScript disabled.
 */

const STORAGE_KEY = "cosmic-hero-motion";

export default function CosmicHero({ fallbackSrc }: { fallbackSrc: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // null = not decided yet (server render / first paint), avoids a hydration mismatch.
  const [animate, setAnimate] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);

  /* Decide once on mount: saved choice wins, otherwise follow the OS. */
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      /* private mode / storage disabled — fall through to the OS setting */
    }
    if (saved === "on" || saved === "off") {
      setAnimate(saved === "on");
      return;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!mq.matches);
    // Follow the OS live, but only while the visitor hasn't chosen for themselves.
    const onChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (stored !== "on" && stored !== "off") setAnimate(!e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Build the scene. Re-runs when the visitor flips the toggle. */
  useEffect(() => {
    if (animate === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setReady(false);
    return startScene(canvas, () => setReady(true), animate);
  }, [animate]);

  const toggle = () => {
    const next = !animate;
    setAnimate(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      /* choice just won't persist — the toggle still works for this visit */
    }
  };

  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-void" aria-hidden="true">
        {/* Only covers the moment before the canvas paints, and JS-off visitors.
            object-top keeps the planet in frame when a wide screen crops this
            portrait image. */}
        <img
          src={fallbackSrc}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${
            ready ? "opacity-0" : "opacity-90"
          }`}
          draggable={false}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* Fade the scene into the page below for legibility. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-void" />
      </div>

      {/* Deliberately outside the aria-hidden wrapper so it stays reachable. */}
      {animate !== null && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={animate}
          className="absolute bottom-6 right-6 z-10 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400 backdrop-blur transition-colors hover:border-crimson/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
        >
          Animation {animate ? "on" : "off"}
        </button>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Scene
   ──────────────────────────────────────────────────────────────────────── */

type Star = { x: number; y: number; r: number; a: number; sp: number; ph: number; cool: boolean };
type Ring = { r: number; len: number; start: number; speed: number; alpha: number; width: number; red: boolean };
type Neb = {
  sprite: HTMLCanvasElement;
  x: number; y: number; s: number;
  rot: number; rotSp: number;
  vx: number; vy: number;
  a: number; ph: number;
};

const TAU = Math.PI * 2;
const TILT = -0.38; // shared disk tilt (radians)
const SQUASH = 0.42; // vertical squash of the ring ellipses

function startScene(
  canvas: HTMLCanvasElement,
  onReady: () => void,
  animate: boolean,
): () => void {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) return () => {};
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let R = 0; // planet radius
  let t = 0;
  let last = performance.now();
  let raf = 0;
  let inView = true;
  let disposed = false;
  let announcedReady = false;

  // Pointer parallax (fine pointers only, very subtle)
  const finePointer = animate && window.matchMedia("(pointer: fine)").matches;
  let px = 0, py = 0, tx = 0, ty = 0;

  const lowPower = (navigator.hardwareConcurrency ?? 8) <= 4;
  const density = lowPower ? 0.6 : 1;

  let stars: Star[] = [];
  let rings: Ring[] = [];
  let nebulae: Neb[] = [];

  /* Pre-rendered red nebula sprite: soft crimson glow + streaky filaments. */
  function makeNebulaSprite(): HTMLCanvasElement {
    const S = 300;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const g = c.getContext("2d")!;
    for (let i = 0; i < 3; i++) {
      const gx = S / 2 + (Math.random() - 0.5) * 80;
      const gy = S / 2 + (Math.random() - 0.5) * 60;
      const rr = S * (0.28 + Math.random() * 0.24);
      const grad = g.createRadialGradient(gx, gy, 0, gx, gy, rr);
      grad.addColorStop(0, "rgba(226,32,48,0.40)");
      grad.addColorStop(0.5, "rgba(150,14,30,0.16)");
      grad.addColorStop(1, "rgba(120,10,24,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
    }
    // Filament streaks — the wispy red strands from the reference.
    for (let k = 0; k < 7; k++) {
      const y0 = S * (0.2 + Math.random() * 0.6);
      g.strokeStyle = `rgba(255,${55 + Math.random() * 30 | 0},70,${0.14 + Math.random() * 0.2})`;
      g.lineWidth = 0.8 + Math.random() * 1.6;
      g.beginPath();
      g.moveTo(S * 0.05, y0);
      g.bezierCurveTo(
        S * 0.35, y0 + (Math.random() - 0.5) * 70,
        S * 0.65, y0 + (Math.random() - 0.5) * 70,
        S * 0.95, y0 + (Math.random() - 0.5) * 50,
      );
      g.stroke();
    }
    return c;
  }

  function rebuild() {
    const area = w * h;
    cx = w * 0.5;
    cy = h * 0.44;
    R = Math.min(w, h) * 0.155;

    // Starfield
    const nStars = Math.round(Math.min(240, Math.max(90, area / 9000)) * density);
    stars = Array.from({ length: nStars }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.4 + Math.random() * 1.2,
      a: 0.3 + Math.random() * 0.65,
      sp: 0.9 + Math.random() * 2.6,
      ph: Math.random() * TAU,
      cool: Math.random() < 0.18, // a few blue-tinted stars
    }));

    // Swirl rings — dense near the planet, sparse far out; inner rings orbit faster.
    const nRings = Math.round(Math.min(110, Math.max(55, area / 16000)) * density);
    rings = Array.from({ length: nRings }, () => {
      const r = R * (1.12 + Math.pow(Math.random(), 1.6) * 3.7);
      const mid = R * 2;
      const alpha =
        (0.07 + 0.2 * Math.exp(-Math.pow((r - mid) / (R * 1.25), 2))) * (0.5 + Math.random() * 0.7);
      return {
        r,
        len: (0.35 + Math.random() * 1.55) * Math.PI,
        start: Math.random() * TAU,
        // Orbit period: inner rings ~8s, outer ~25s — clearly visible, still calm.
        speed: ((R * 0.8) / r) * (Math.random() < 0.9 ? 1 : -1) * (0.6 + Math.random() * 0.9),
        alpha,
        width: 0.6 + Math.random() * 1.3,
        red: Math.random() < 0.14,
      };
    });

    // Nebula instances — clustered top-right and along the bottom, one faint mid-left.
    const anchors = [
      { x: 0.68, y: 0.08, s: 1.6 }, { x: 0.92, y: 0.20, s: 1.3 }, { x: 0.38, y: 0.04, s: 1.1 },
      { x: 0.12, y: 0.88, s: 1.2 }, { x: 0.52, y: 0.94, s: 1.5 }, { x: 0.88, y: 0.84, s: 1.2 },
      { x: 0.06, y: 0.18, s: 0.8 },
    ];
    nebulae = anchors.map((a) => ({
      sprite: makeNebulaSprite(),
      x: a.x * w + (Math.random() - 0.5) * 40,
      y: a.y * h + (Math.random() - 0.5) * 30,
      s: (w * 0.4 * a.s * (0.85 + Math.random() * 0.3)) / 300,
      rot: (Math.random() - 0.5) * 0.6,
      rotSp: (Math.random() - 0.5) * 0.05,
      vx: (Math.random() - 0.5) * 11,
      vy: (Math.random() - 0.5) * 5,
      a: 0.5 + Math.random() * 0.35,
      ph: Math.random() * TAU,
    }));
  }

  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuild();
  }

  /** Overlap of the arc [a0, a0+len] with the angular window [lo, hi] (radians). */
  function arcOverlap(a0: number, len: number, lo: number, hi: number): Array<[number, number]> {
    const out: Array<[number, number]> = [];
    const B = a0 + len;
    for (const k of [0, TAU]) {
      const s = Math.max(a0, lo + k);
      const e = Math.min(B, hi + k);
      if (e > s + 0.001) out.push([s, e]);
    }
    return out;
  }

  function drawNebulae() {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (const n of nebulae) {
      // slow drift with wrap-around
      let x = n.x + n.vx * t + px * 1.6;
      let y = n.y + n.vy * t + py * 1.6;
      const span = w * 1.4;
      x = ((((x + w * 0.2) % span) + span) % span) - w * 0.2;
      const rot = n.rot + n.rotSp * t;
      const alpha = n.a * (0.68 + 0.32 * Math.sin(t * 0.32 + n.ph));
      const size = 300 * n.s;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.drawImage(n.sprite, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawStars() {
    for (const s of stars) {
      // Clamp: the twinkle curve dips below zero, and a negative alpha makes an
      // invalid colour string that the canvas silently ignores — leaving the star
      // painted in the previous star's colour. Harmless mid-animation, but visible
      // when the scene is frozen.
      const a = Math.max(0, s.a * (0.42 + 0.58 * Math.sin(t * s.sp + s.ph)));
      ctx.fillStyle = s.cool ? `rgba(185,200,255,${a})` : `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x + px * 2, s.y + py * 2, s.r, 0, TAU);
      ctx.fill();
    }
  }

  function drawRings(pass: "back" | "front") {
    const lo = pass === "back" ? Math.PI : 0;
    const hi = pass === "back" ? TAU : Math.PI;
    ctx.save();
    ctx.translate(cx + px, cy + py);
    // Slow wobble of the whole disk — reads as the ring system rotating in 3D.
    ctx.rotate(TILT + 0.05 * Math.sin(t * 0.13));
    for (const ring of rings) {
      const a0 = (((ring.start + t * ring.speed) % TAU) + TAU) % TAU;
      const segs = arcOverlap(a0, ring.len, lo, hi);
      if (!segs.length) continue;
      ctx.strokeStyle = ring.red
        ? `rgba(214,42,58,${ring.alpha * 1.25})`
        : `rgba(196,201,214,${ring.alpha})`;
      ctx.lineWidth = ring.width;
      for (const [s, e] of segs) {
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.r, ring.r * SQUASH, 0, s, e);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPlanet() {
    const pr = R * (1 + 0.022 * Math.sin(t * 0.75));
    const x = cx + px;
    const y = cy + py;
    const grad = ctx.createRadialGradient(x - pr * 0.45, y - pr * 0.5, pr * 0.1, x, y, pr);
    grad.addColorStop(0, "#131318");
    grad.addColorStop(0.55, "#060608");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, pr, 0, TAU);
    ctx.fill();
    // faint rim light on the flare side
    ctx.strokeStyle = "rgba(190,200,225,0.12)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, pr - 0.8, flareAngle() - 1.15, flareAngle() + 1.15);
    ctx.stroke();
  }

  function flareAngle() {
    // The star slowly sweeps along the planet's rim — the clearest cue that
    // the whole scene is alive (full sweep ≈ 25s).
    return -2.35 + 0.3 * Math.sin(t * 0.25);
  }

  function drawFlare() {
    const ang = flareAngle();
    const fx = cx + px + Math.cos(ang) * R * 0.96;
    const fy = cy + py + Math.sin(ang) * R * 0.96;
    const pulse = 0.7 + 0.3 * Math.sin(t * 2.2) + 0.06 * Math.sin(t * 6.1);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // Soft bloom
    const glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, R * 1.15);
    glow.addColorStop(0, `rgba(255,255,255,${0.55 * pulse})`);
    glow.addColorStop(0.12, "rgba(200,212,255,0.26)");
    glow.addColorStop(0.45, "rgba(130,150,255,0.06)");
    glow.addColorStop(1, "rgba(130,150,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(fx, fy, R * 1.15, 0, TAU);
    ctx.fill();

    // Diffraction spikes
    const spike = (rot: number, len: number, th: number, alpha: number) => {
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(rot);
      const lg = ctx.createLinearGradient(-len, 0, len, 0);
      lg.addColorStop(0, "rgba(255,255,255,0)");
      lg.addColorStop(0.5, `rgba(255,255,255,${alpha * pulse})`);
      lg.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = lg;
      ctx.fillRect(-len, -th / 2, len * 2, th);
      ctx.restore();
    };
    spike(0.08, R * 2.1, 2, 0.85);
    spike(Math.PI / 2 + 0.08, R * 0.95, 1.6, 0.6);
    spike(0.85, R * 0.5, 1.2, 0.3);

    // Core
    ctx.fillStyle = `rgba(255,255,255,${0.95 * pulse})`;
    ctx.beginPath();
    ctx.arc(fx, fy, 2.4, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  /** Paints the whole scene once, at the current value of `t`. */
  function draw() {
    ctx.fillStyle = "#050506";
    ctx.fillRect(0, 0, w, h);

    drawNebulae();
    drawStars();
    drawRings("back");
    drawPlanet();
    drawRings("front");
    drawFlare();

    if (!announcedReady) {
      announcedReady = true;
      onReady();
    }
  }

  function frame(now: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!inView || document.hidden) {
      last = now; // don't accumulate time while paused
      return;
    }
    const dt = Math.min(50, now - last) / 1000;
    last = now;
    t += dt;

    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;

    draw();
  }

  const onPointer = (e: PointerEvent) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 10;
    ty = (e.clientY / window.innerHeight - 0.5) * 7;
  };
  if (finePointer) window.addEventListener("pointermove", onPointer, { passive: true });

  const onVis = () => { last = performance.now(); };
  if (animate) document.addEventListener("visibilitychange", onVis);

  const io = animate
    ? new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0 })
    : null;
  io?.observe(canvas);

  // Still needed when frozen: the frame has to be re-composed if the window
  // is resized or the phone is rotated.
  const ro = new ResizeObserver(() => {
    resize();
    if (!animate) draw();
  });
  if (canvas.parentElement) ro.observe(canvas.parentElement);

  resize();
  if (animate) {
    raf = requestAnimationFrame(frame);
  } else {
    // A single frozen frame: the real artwork, composed for this screen, no motion.
    draw();
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    io?.disconnect();
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    if (finePointer) window.removeEventListener("pointermove", onPointer);
  };
}
