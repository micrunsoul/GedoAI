import { Hero } from "./components/Hero";
import { Concept } from "./components/Concept";
import { Features } from "./components/Features";
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
        <Footer />
      </main>
    </div>
  );
}
