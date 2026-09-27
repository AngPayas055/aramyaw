"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ConfigProvider } from "antd";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Footer from "./components/Footer";
import ContactSection from "./components/ContactSection";
import JerseySection from "./components/JerseySection";
import LeaguesSection from "./components/LeaguesSection";
import ProofStrip from "./components/ProofStrip";

type Destination = "/admin" | "/manager" | "home";

function subscribe() {
  return () => {};
}

function getSnapshot(): Destination {
  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!token || !savedUser) return "home";

  try {
    const user = JSON.parse(savedUser) as { role?: string };
    if (user.role === "admin") return "/admin";
    if (user.role === "user") return "/manager";
  } catch {
  }

  return "home";
}

function getServerSnapshot(): null {
  return null;
}

export default function Home() {
  const router = useRouter();
  const destination = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (destination === "/admin" || destination === "/manager") {
      router.replace(destination);
    }
  }, [destination, router]);

  if (destination !== "home") return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f15a24",
          borderRadius: 12,
          fontFamily: "var(--font-body)",
          controlHeight: 48,
        },
      }}
    >
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