"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type ElementType = "default" | "wood" | "fire" | "earth" | "metal" | "water" | "link";

const elementColors: Record<ElementType, { main: string; glow: string }> = {
  default: { main: "rgba(201, 169, 98, 1)", glow: "rgba(201, 169, 98, 0.4)" },
  wood: { main: "rgba(45, 90, 74, 1)", glow: "rgba(74, 154, 122, 0.4)" },
  fire: { main: "rgba(199, 62, 58, 1)", glow: "rgba(255, 107, 107, 0.4)" },
  earth: { main: "rgba(201, 169, 98, 1)", glow: "rgba(255, 215, 0, 0.4)" },
  metal: { main: "rgba(212, 212, 212, 1)", glow: "rgba(255, 255, 255, 0.4)" },
  water: { main: "rgba(30, 58, 95, 1)", glow: "rgba(74, 122, 191, 0.4)" },
  link: { main: "rgba(201, 169, 98, 1)", glow: "rgba(201, 169, 98, 0.6)" },
};

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [elementType, setElementType] = useState<ElementType>("default");
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.3 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const outerSpringConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const outerXSpring = useSpring(cursorX, outerSpringConfig);
  const outerYSpring = useSpring(cursorY, outerSpringConfig);

  const detectElementType = useCallback((target: HTMLElement): ElementType => {
    if (target.closest("[data-element='wood']") || target.classList.contains("text-wood")) {
      return "wood";
    }
    if (target.closest("[data-element='fire']") || target.classList.contains("text-fire")) {
      return "fire";
    }
    if (target.closest("[data-element='earth']") || target.classList.contains("text-earth")) {
      return "earth";
    }
    if (target.closest("[data-element='metal']") || target.classList.contains("text-metal")) {
      return "metal";
    }
    if (target.closest("[data-element='water']") || target.classList.contains("text-water")) {
      return "water";
    }

    const isInteractive =
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.closest("a") ||
      target.closest("button") ||
      target.classList.contains("cursor-pointer") ||
      getComputedStyle(target).cursor === "pointer";

    if (isInteractive) return "link";
    return "default";
  }, []);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const type = detectElementType(target);
      setElementType(type);
      setIsHovering(type !== "default");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);

    document.body.style.cursor = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.body.style.cursor = "auto";
    };
  }, [cursorX, cursorY, detectElementType, isTouchDevice]);

  if (isTouchDevice) return null;

  const colors = elementColors[elementType];

  return (
    <>
      {/* 外輪（遅延追従） */}
      <motion.div
        className="fixed pointer-events-none z-[9999] hidden md:block"
        style={{
          x: outerXSpring,
          y: outerYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full border"
          style={{ borderColor: colors.main }}
          animate={{
            width: isClicking ? 24 : isHovering ? 56 : 40,
            height: isClicking ? 24 : isHovering ? 56 : 40,
            opacity: isVisible ? (isHovering ? 0.8 : 0.5) : 0,
            borderWidth: isHovering ? 2 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </motion.div>

      {/* 中心点（即時追従） */}
      <motion.div
        className="fixed pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          className="rounded-full"
          style={{ backgroundColor: colors.main }}
          animate={{
            width: isClicking ? 16 : isHovering ? 10 : 6,
            height: isClicking ? 16 : isHovering ? 10 : 6,
            opacity: isVisible ? 1 : 0,
            boxShadow: `0 0 ${isHovering ? 20 : 10}px ${colors.glow}`,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />

        {isHovering && (
          <motion.div
            className="absolute rounded-full border"
            style={{
              borderColor: colors.main,
              top: "50%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ width: 10, height: 10, opacity: 0.8 }}
            animate={{ width: 40, height: 40, opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.div>

      {/* 五行シンボル（ホバー時） */}
      {isHovering && elementType !== "default" && elementType !== "link" && (
        <motion.div
          className="fixed pointer-events-none z-[9998] hidden md:block"
          style={{
            x: outerXSpring,
            y: outerYSpring,
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <div className="text-2xl font-serif" style={{ color: colors.main }}>
            {elementType === "wood" && "木"}
            {elementType === "fire" && "火"}
            {elementType === "earth" && "土"}
            {elementType === "metal" && "金"}
            {elementType === "water" && "水"}
          </div>
        </motion.div>
      )}
    </>
  );
}
