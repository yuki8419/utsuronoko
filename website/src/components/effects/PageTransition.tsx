"use client";

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface TransitionContextType {
  startTransition: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  startTransition: () => {},
  isTransitioning: false,
});

export const usePageTransition = () => useContext(TransitionContext);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetHref, setTargetHref] = useState("");
  const router = useRouter();

  const startTransition = useCallback((href: string) => {
    setTargetHref(href);
    setIsTransitioning(true);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    if (targetHref) {
      router.push(targetHref);
      // 遷移後少し待ってからフェードアウト
      setTimeout(() => {
        setIsTransitioning(false);
        setTargetHref("");
      }, 300);
    }
  }, [targetHref, router]);

  return (
    <TransitionContext.Provider value={{ startTransition, isTransitioning }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <InkTransitionOverlay onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

// 墨の広がりパターンを事前計算（毎レンダー変わらないように）
const INK_CIRCLES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  const distanceOffset = [0.2, 0.8, 0.4, 0.6, 0.1, 0.9, 0.3, 0.7][i]; // 固定のランダム風値
  const distance = 150 + distanceOffset * 50;
  const radiusOffset = [0.5, 0.2, 0.8, 0.4, 0.6, 0.3, 0.9, 0.1][i];
  const durationOffset = [0.1, 0.25, 0.05, 0.2, 0.15, 0.28, 0.08, 0.22][i];
  return {
    x: 200 + Math.cos(angle) * distance * 0.5,
    y: 200 + Math.sin(angle) * distance * 0.5,
    radius: 60 + radiusOffset * 40,
    duration: 0.5 + durationOffset * 0.3,
    delay: 0.1 + i * 0.05,
  };
});

function InkTransitionOverlay({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[10001] pointer-events-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 墨の滲みエフェクト */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 中央から広がる墨 */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 3 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={onComplete}
        >
          <svg
            viewBox="0 0 400 400"
            className="w-[150vmax] h-[150vmax]"
          >
            <defs>
              <filter id="ink-blur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
              </filter>
              <radialGradient id="ink-gradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a0a0a" stopOpacity="1" />
                <stop offset="70%" stopColor="#0a0a0a" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* メインの墨の滲み */}
            <motion.circle
              cx="200"
              cy="200"
              r="200"
              fill="url(#ink-gradient)"
              filter="url(#ink-blur)"
              initial={{ r: 0 }}
              animate={{ r: 200 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* 不規則な墨の広がり（事前計算済み） */}
            {INK_CIRCLES.map((circle, i) => (
              <motion.circle
                key={i}
                cx={circle.x}
                cy={circle.y}
                fill="#0a0a0a"
                initial={{ r: 0 }}
                animate={{ r: circle.radius }}
                transition={{
                  duration: circle.duration,
                  delay: circle.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </svg>
        </motion.div>

        {/* 太極図シンボル（中央） */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-24 md:h-24">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="rgba(201, 169, 98, 0.5)"
              strokeWidth="1"
            />
            <path
              d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2"
              fill="#f5f5f0"
            />
            <path
              d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2"
              fill="#0a0a0a"
            />
            <circle cx="50" cy="26" r="6" fill="#0a0a0a" />
            <circle cx="50" cy="74" r="6" fill="#f5f5f0" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}

// トランジション付きリンクコンポーネント
export function TransitionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const { startTransition } = usePageTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
