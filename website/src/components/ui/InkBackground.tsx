"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function InkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<InkParticle[]>([]);
  const frameCountRef = useRef(0);
  const scrollRef = useRef(0);
  const isVisibleRef = useRef(true);
  const lastTimeRef = useRef(0);

  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 50, damping: 30 });

  interface InkParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    life: number;
    maxLife: number;
  }

  const colors = [
    "45, 90, 74",
    "199, 62, 58",
    "201, 169, 98",
    "150, 150, 150",
    "30, 58, 95",
  ];

  useEffect(() => {
    const unsubscribe = smoothScroll.on("change", (v) => {
      scrollRef.current = v;
    });
    return unsubscribe;
  }, [smoothScroll]);

  // IntersectionObserverでCanvas可視性を監視
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const createParticle = useCallback((canvas: HTMLCanvasElement): InkParticle => {
    const side = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (side) {
      case 0:
        x = Math.random() * canvas.width;
        y = -100;
        break;
      case 1:
        x = canvas.width + 100;
        y = Math.random() * canvas.height;
        break;
      case 2:
        x = Math.random() * canvas.width;
        y = canvas.height + 100;
        break;
      default:
        x = -100;
        y = Math.random() * canvas.height;
        break;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angle = Math.atan2(centerY - y, centerX - x);
    const speed = 0.06 + Math.random() * 0.08;

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 200 + Math.random() * 250,
      opacity: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: 600 + Math.random() * 300,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = particlesRef.current;

    const animate = (timestamp: number) => {
      // 可視状態でなければスキップ（ただしループは継続）
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // フレームスキップ（30fps制限）
      const elapsed = timestamp - lastTimeRef.current;
      if (elapsed < 33) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = timestamp;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.fillStyle = "rgba(10, 10, 10, 0.012)";
      ctx.fillRect(0, 0, width, height);

      frameCountRef.current++;

      // パーティクル生成（最大4個に制限）
      if (frameCountRef.current % 180 === 0 && particles.length < 4) {
        particles.push(createParticle(canvas));
      }

      // パーティクル更新・描画
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.2) {
          p.opacity = lifeRatio / 0.2;
        } else if (lifeRatio > 0.7) {
          p.opacity = 1 - (lifeRatio - 0.7) / 0.3;
        } else {
          p.opacity = 1;
        }

        // シンプルな円形グラデーション
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        const baseOpacity = 0.04 * p.opacity;
        gradient.addColorStop(0, `rgba(${p.color}, ${baseOpacity})`);
        gradient.addColorStop(0.5, `rgba(${p.color}, ${baseOpacity * 0.4})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 初期パーティクル
    particles.push(createParticle(canvas));

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [createParticle]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* CSS-onlyグラデーション（GPUアクセラレーション） */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(45, 90, 74, 0.03) 0%, transparent 60%)",
            x: useTransform(smoothScroll, [0, 1], [0, 80]),
            y: useTransform(smoothScroll, [0, 1], [0, 120]),
          }}
        />

        <motion.div
          className="absolute top-1/4 -right-32 w-[350px] h-[350px] rounded-full will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(199, 62, 58, 0.025) 0%, transparent 60%)",
            x: useTransform(smoothScroll, [0, 1], [0, -60]),
            y: useTransform(smoothScroll, [0, 1], [0, 150]),
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(201, 169, 98, 0.025) 0%, transparent 60%)",
            scale: useTransform(smoothScroll, [0, 0.5, 1], [0.6, 1, 0.8]),
            opacity: useTransform(smoothScroll, [0, 0.3, 0.7, 1], [0.5, 1, 1, 0.4]),
          }}
        />

        <motion.div
          className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full will-change-transform"
          style={{
            background: "radial-gradient(circle, rgba(30, 58, 95, 0.03) 0%, transparent 60%)",
            x: useTransform(smoothScroll, [0, 1], [0, 100]),
            y: useTransform(smoothScroll, [0, 1], [0, -80]),
          }}
        />
      </div>
    </>
  );
}
