"use client";

import { ConfigProvider } from "antd";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import ContactSection from "./components/ContactSection";
import JerseySection from "./components/JerseySection";
import LeaguesSection from "./components/LeaguesSection";
import ProofStrip from "./components/ProofStrip";

export default function Home() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#f15a24", borderRadius: 12, fontFamily: "var(--font-body)", controlHeight: 48 } }}>
      <main>
        <Header />
        <Hero />
        <ProofStrip />
        <LeaguesSection />
        <JerseySection />
        <ContactSection />
        <Footer />
      </main>
    </ConfigProvider>
  );
}
