import { Hero } from "./components/Hero";
import { Concept } from "./components/Concept";
import { Features } from "./components/Features";
import { DigitalAvatarSection } from "./components/DigitalAvatarSection";
import { OpenSourceSection } from "./components/OpenSourceSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Concept />
        <Features />
        <DigitalAvatarSection />
        <OpenSourceSection />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}
