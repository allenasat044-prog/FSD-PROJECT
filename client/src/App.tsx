import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { ParallaxHero } from "@/components/ui/parallax-hero";
import { Component as FeaturesCard } from "@/components/ui/features-card";
import AsciiDashboard from "@/components/ascii/AsciiDashboard";
import Gallery from "@/pages/Gallery";
import ArtworkPage from "@/pages/ArtworkPage";
import AuthPage from "@/pages/AuthPage";
import AuthCallback from "@/pages/AuthCallback";
import FaqPage from "@/pages/FaqPage";
import NotFound from "@/pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <ParallaxHero title="ASCII" className="w-full" />
      <FeaturesCard onLaunch={() => navigate("/explore")} />
    </>
  );
}

function Footer() {
  return <footer className="border-t border-zinc-900 py-10 text-center font-mono text-xs text-zinc-500">░▒▓█ ASCII_CAM — React · Express · MongoDB</footer>;
}

// Every page change starts at the top (unless the URL has a #hash).
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
}

function Shell() {
  const navigate = useNavigate();
  const location = useLocation();
  const needAuth = () => navigate("/login", { state: { from: location.pathname } });
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/explore" element={<AsciiDashboard onNeedAuth={needAuth} />} />
        <Route path="/gallery" element={<Gallery onNeedAuth={needAuth} />} />
        <Route path="/gallery/:id" element={<ArtworkPage onNeedAuth={needAuth} />} />
        <Route path="/faq" element={<><FaqPage /><Footer /></>} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AuthProvider>
  );
}
