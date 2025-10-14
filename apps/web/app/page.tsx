import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";

export default function Home() {
  return (
    <>
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <Pricing />
          <FAQ />
        </main>
        <Footer />
      </div>
    </>
  )
}
