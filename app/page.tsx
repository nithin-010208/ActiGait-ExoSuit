import { Features } from "../components/Features";
import { FinalCta } from "../components/FinalCta";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { MetricsStrip } from "../components/MetricsStrip";
import { Navbar } from "../components/Navbar";
import { ProductShowcase } from "../components/ProductShowcase";
import { Safety } from "../components/Safety";
import { Technology } from "../components/Technology";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-cyan focus:px-3 focus:py-2 focus:text-sm focus:text-[#062628]"
      >
        Skip to content
      </a>
      <div id="top">
        <Navbar />
        <main id="main">
          <Hero />
          <MetricsStrip />
          <Technology />
          <Features />
          <ProductShowcase />
          <HowItWorks />
          <Safety />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </>
  );
}
