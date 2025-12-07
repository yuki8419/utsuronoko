import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import InkBackground from "@/components/ui/InkBackground";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import VerticalTextSection from "@/components/sections/VerticalTextSection";
import StorySection from "@/components/sections/StorySection";
import { SectionDivider } from "@/components/effects/SectionTransition";

export default function Home() {
  return (
    <>
      <InkBackground />
      <Header />
      <main className="relative z-10 bg-transparent min-h-screen">
        <HeroSection />
        <SectionDivider variant="brush" />
        <IntroSection />
        <SectionDivider variant="ink" />
        <VerticalTextSection />
        <SectionDivider variant="dots" />
        <StorySection />
      </main>
      <Footer />
    </>
  );
}
