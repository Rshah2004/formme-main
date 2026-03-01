import * as React from "react";
import { useEffect, useRef } from "react";

const FabricBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false, lastMove: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      w = Math.max(1, window.innerWidth);
      h = Math.max(1, window.innerHeight);
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (x: number, y: number) => {
      mouseRef.current = {
        x,
        y,
        active: true,
        lastMove: performance.now(),
      };
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      onMove(t.clientX, t.clientY);
    };

    const onLeave = () => {
      mouseRef.current.active = false;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchend", onLeave);

    let t = 0;
    const render = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Base cloth tone
      ctx.fillStyle = "#f6efe4";
      ctx.fillRect(0, 0, w, h);

      // Warm wash
      const wash = ctx.createLinearGradient(0, 0, w, h);
      wash.addColorStop(0, "rgba(52, 76, 61, 0.10)");
      wash.addColorStop(0.55, "rgba(215, 186, 142, 0.08)");
      wash.addColorStop(1, "rgba(151, 67, 32, 0.10)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const mx = mouse.x;
      const my = mouse.y;
      const idleSeconds = mouse.active ? (performance.now() - mouse.lastMove) / 1000 : 999;
      const rippleStrength = mouse.active ? Math.max(0.6, Math.exp(-idleSeconds * 0.35)) : 0;

      // Gentle highlight bloom at cursor
      if (mouse.active && !prefersReduced) {
        const bloom = ctx.createRadialGradient(mx, my, 0, mx, my, 280);
        bloom.addColorStop(0, "rgba(255, 255, 255, 0.20)");
        bloom.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, w, h);
      }

      if (prefersReduced) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      // Horizontal weave
      const hSpacing = 16;
      for (let y = -hSpacing; y < h + hSpacing; y += hSpacing) {
        ctx.beginPath();
        const phase = t + y * 0.03;
        for (let x = 0; x <= w; x += 10) {
          const dist = Math.hypot(x - mx, y - my);
          const influence = mouse.active ? Math.max(0, 1 - dist / 520) : 0;
          const ripple = Math.sin(dist * 0.06 - t * 3.8) * (22 * rippleStrength) * (influence + 0.2);
          const wave =
            Math.sin(x * 0.012 + phase) * (3.2 + influence * 12) +
            Math.cos(y * 0.018 + t) * (1.6 + influence * 6);
          const wind = Math.sin(t * 0.6 + x * 0.007) * 2.4;
          const offset = wave + wind + ripple + influence * 14 * Math.sin(t * 2.2 + dist * 0.02);
          const yy = y + offset;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Vertical weave
      const vSpacing = 22;
      for (let x = -vSpacing; x < w + vSpacing; x += vSpacing) {
        ctx.beginPath();
        const phase = t + x * 0.02;
        for (let y = 0; y <= h; y += 10) {
          const dist = Math.hypot(x - mx, y - my);
          const influence = mouse.active ? Math.max(0, 1 - dist / 560) : 0;
          const ripple = Math.sin(dist * 0.065 - t * 4.0) * (18 * rippleStrength) * (influence + 0.2);
          const wave =
            Math.cos(y * 0.012 + phase) * (2.2 + influence * 8) +
            Math.sin(x * 0.018 + t) * (1.0 + influence * 3);
          const wind = Math.cos(t * 0.55 + y * 0.01) * 2.0;
          const offset = wave + wind + ripple + influence * 12 * Math.cos(t * 1.8 + dist * 0.02);
          const xx = x + offset;
          if (y === 0) ctx.moveTo(xx, y);
          else ctx.lineTo(xx, y);
        }
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchend", onLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const range = 600;
    let raf: number | null = null;

    const update = () => {
      const y = window.scrollY || 0;
      const progress = Math.min(1, Math.max(0, y / range));
      const opacity = 0.9 * (1 - progress);
      const blur = 6 * progress;
      canvas.style.opacity = String(opacity);
      canvas.style.filter = `blur(${blur.toFixed(2)}px)`;
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        update();
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none"
      aria-hidden="true"
    />
  );
};

export default FabricBackdrop;
