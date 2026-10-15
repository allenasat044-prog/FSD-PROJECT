import { useState } from "react";
import Navbar, { type Target, type View } from "@/components/Navbar";
import { ParallaxHero } from "@/components/ui/parallax-hero";
import { Component as FeaturesCard } from "@/components/ui/features-card";
import Faq from "@/components/Faq";
import AsciiDashboard from "@/components/ascii/AsciiDashboard";
import Gallery from "@/pages/Gallery";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider } from "@/context/AuthContext";

export default function App() {
  const [view, setView] = useState<View>("home");

  const go = (target: Target) => {
    if (target === "features" || target === "faq") {
      setView("home");
      setTimeout(() => document.getElementById(target)?.scrollIntoView(), 30);
      return;
    }
    setView(target);
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        <Navbar view={view} go={go} />
        {view === "home" && (
          <>
            <ParallaxHero title="ASCII" className="w-full" />
            <FeaturesCard onLaunch={() => go("explore")} />
            <Faq />
            <footer className="border-t border-zinc-900 py-10 text-center font-mono text-xs text-zinc-500">░▒▓█ ASCII_CAM — React · Express · MongoDB</footer>
          </>
        )}
        {view === "explore" && <AsciiDashboard onNeedAuth={() => go("login")} />}
        {view === "gallery" && <Gallery onNeedAuth={() => go("login")} />}
        {view === "login" && <AuthPage onDone={() => go("explore")} />}
      </div>
    </AuthProvider>
  );
}
