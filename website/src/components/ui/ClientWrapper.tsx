"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PageTransitionProvider } from "@/components/effects/PageTransition";

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), {
  ssr: false,
});

const LoadingScreen = dynamic(() => import("@/components/ui/LoadingScreen"), {
  ssr: false,
});

const InkFlowEffect = dynamic(() => import("@/components/effects/InkFlowEffect"), {
  ssr: false,
});

const ParallaxLayers = dynamic(() => import("@/components/effects/ParallaxLayers"), {
  ssr: false,
});

export function ClientComponents({ children }: { children?: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(true); // デフォルトtrue（SSR対策）

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <PageTransitionProvider>
      <LoadingScreen />
      <CustomCursor />
      {/* モバイルでは重いエフェクトを無効化 */}
      {!isMobile && (
        <>
          <InkFlowEffect />
          <ParallaxLayers />
        </>
      )}
      {children}
    </PageTransitionProvider>
  );
}
