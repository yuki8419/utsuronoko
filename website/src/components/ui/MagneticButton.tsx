"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { usePageTransition } from "@/components/effects/PageTransition";

interface MagneticButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  magneticStrength?: number;
  useTransition?: boolean;
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  magneticStrength = 0.4,
  useTransition = true,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { startTransition } = usePageTransition();

  // マウス位置
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // スプリングで滑らかに
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // テキストの追従（逆方向に少し）
  const textX = useTransform(x, (value) => value * -0.2);
  const textY = useTransform(y, (value) => value * -0.2);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * magneticStrength;
    const deltaY = (e.clientY - centerY) * magneticStrength;

    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  const content = (
    <motion.div
      ref={ref}
      className={`relative inline-block cursor-pointer ${className}`}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      {/* 背景のグロー */}
      <motion.div
        className="absolute inset-0 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: "radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%)",
          filter: "blur(15px)",
        }}
      />

      {/* 墨の波紋エフェクト */}
      <motion.div
        className="absolute inset-0 rounded-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        {isHovered && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: "radial-gradient(circle, rgba(201, 169, 98, 0.2) 0%, transparent 70%)",
                left: "50%",
                top: "50%",
                width: "100%",
                height: "100%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </>
        )}
      </motion.div>

      {/* コンテンツ */}
      <motion.div className="relative z-10" style={{ x: textX, y: textY }}>
        {children}
      </motion.div>

      {/* ボーダーアニメーション */}
      <motion.div
        className="absolute inset-0 rounded-lg border border-earth/30"
        animate={{
          borderColor: isHovered ? "rgba(201, 169, 98, 0.6)" : "rgba(201, 169, 98, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />

      {/* コーナー装飾 */}
      <motion.div
        className="absolute top-0 left-0 w-3 h-3 border-t border-l border-earth"
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute top-0 right-0 w-3 h-3 border-t border-r border-earth"
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-earth"
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-earth"
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      />
    </motion.div>
  );

  if (href) {
    const handleClick = (e: React.MouseEvent) => {
      if (useTransition) {
        e.preventDefault();
        startTransition(href);
      }
    };

    return (
      <a href={href} onClick={handleClick}>
        {content}
      </a>
    );
  }

  return content;
}

// 墨の波紋が広がるエフェクト用のラッパー
export function InkRippleWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 1000);
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} onClick={handleClick}>
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ width: 0, height: 0, opacity: 0.6 }}
          animate={{ width: 500, height: 500, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(201, 169, 98, 0.3) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      ))}
      {children}
    </div>
  );
}

// テキストにホバーで下線が伸びるエフェクト
export function AnimatedUnderline({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-px bg-earth"
        initial={{ width: "0%" }}
        animate={{ width: isHovered ? "100%" : "0%" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      />
    </span>
  );
}
