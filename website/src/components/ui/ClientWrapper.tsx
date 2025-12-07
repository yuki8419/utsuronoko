"use client";

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
  return (
    <PageTransitionProvider>
      <LoadingScreen />
      <CustomCursor />
      <InkFlowEffect />
      <ParallaxLayers />
      {children}
    </PageTransitionProvider>
  );
}
