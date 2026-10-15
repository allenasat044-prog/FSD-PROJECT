"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Camera, Film, Image as ImageIcon, Download, Sparkles, ShieldCheck, Terminal, Lightbulb, Layers, BarChart3, Gauge, Cpu, Lock, Palette } from "lucide-react";

export const Component = ({ onLaunch }: { onLaunch?: () => void }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState(0);
  const [selectedSet, setSelectedSet] = useState(0);

  const features = [
    { id: 0, title: "Live Camera", desc: "Front or back camera, switchable on the fly", icon: Camera, stat: "60fps" },
    { id: 1, title: "Video Files", desc: "Play, pause, scrub and loop any video", icon: Film, stat: "Any video" },
    { id: 2, title: "Still Images", desc: "JPG, PNG, GIF, WEBP, SVG, AVIF and more", icon: ImageIcon, stat: "Full detail" },
    { id: 3, title: "Export", desc: "PNG, JPG, WEBP, SVG or plain TXT", icon: Download, stat: "5 formats" },
  ];

  const metrics = [
    { label: "Resolution", value: "500", unit: "cols", trend: "max" },
    { label: "Frame rate", value: "60", unit: "fps", trend: "adaptive" },
    { label: "Character sets", value: "5", unit: "", trend: "+ invert" },
    { label: "Data uploaded", value: "0", unit: "bytes", trend: "local" },
  ];

  const charsets = [
    { name: "Detailed", ramp: ".'`^\",:;Il!i><~+_-?]" },
    { name: "Classic", ramp: " .:-=+*#%@" },
    { name: "Blocks", ramp: " ░▒▓█" },
    { name: "Binary", ramp: " 01" },
    { name: "Matrix", ramp: "ｦｧｨｩｪｫｬｭｮｯ0123" },
    { name: "Color", ramp: "true color" },
  ];

  const codeExample = `// sample pixels, map brightness to a character
ctx.drawImage(source, 0, 0, cols, rows);
const l = luma(px) * contrast + brightness;
out += ramp[Math.round(l * (ramp.length - 1))];

// ✓ resolution auto-tunes to hold 60fps`;

  const stats = [
    { label: "Max columns", value: "500", icon: Layers },
    { label: "Target speed", value: "60fps", icon: Gauge },
    { label: "Processing", value: "On-device", icon: Cpu },
    { label: "Privacy", value: "Nothing uploaded", icon: ShieldCheck },
  ];

  const activeFeature = features[activeTab];

  return (
    <section id="features" className="w-full bg-black py-24 px-4 md:px-8 text-white font-sans antialiased overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col gap-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-700 w-fit">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold tracking-wider text-zinc-300">Built for the love of glowing text</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white">Turn anything into ASCII</h2>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            Your webcam, a video file or a still image becomes live ASCII art in the browser. Tune it with a few controls, then export it.
          </p>
          {onLaunch && (
            <button onClick={onLaunch} className="w-fit rounded-full bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-zinc-200 transition-colors">
              Open the dashboard
            </button>
          )}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[280px]">
          <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-8 flex flex-col justify-between transition-all duration-300 hover:border-zinc-700">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold">
                <Lightbulb className="w-3.5 h-3.5" /> Three sources, one pipeline
              </div>
              <h3 className="text-3xl font-bold tracking-tight mb-2 text-white">Core Features</h3>
              <p className="text-sm text-zinc-400">Click to explore what ASCII_CAM can do</p>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isActive = activeTab === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveTab(feature.id)}
                    className={cn(
                      "relative overflow-hidden rounded-xl p-4 border transition-all duration-300 flex flex-col",
                      isActive ? "bg-zinc-800 border-zinc-600" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mb-2 transition-colors", isActive ? "text-white" : "text-zinc-500")} />
                    <span className="text-xs font-bold text-white text-left">{feature.title}</span>
                    <span className="text-[10px] text-zinc-400 text-left mt-1 line-clamp-1">{feature.stat}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 mt-6 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <p className="text-xs font-mono text-zinc-500 mb-1">Selected:</p>
              <p className="text-lg font-bold text-white">{activeFeature.title}</p>
              <p className="text-xs text-zinc-400 mt-1">{activeFeature.desc}</p>
              <div className="text-3xl font-bold font-mono text-white mt-3">{activeFeature.stat}</div>
            </div>
          </div>

          {/* Metrics */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col transition-all duration-300 hover:border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg"><BarChart3 className="w-5 h-5 text-white" /></div>
              <span className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-semibold">Specs</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Performance</h3>
            <p className="text-xs text-zinc-400 mb-4">What it can do</p>
            <div className="space-y-2">
              {metrics.map((m, idx) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMetric(idx)}
                  className={cn("w-full text-left p-2 rounded-lg transition-all duration-200 border", selectedMetric === idx ? "bg-zinc-800 border-zinc-600" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700")}
                >
                  <p className="text-[10px] text-zinc-400">{m.label}</p>
                  <div className="flex items-baseline justify-between mt-0.5">
                    <span className="text-sm font-bold text-white">{m.value} <span className="text-[10px] text-zinc-400 font-normal">{m.unit}</span></span>
                    <span className="text-[10px] text-zinc-300 font-semibold">{m.trend}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Character sets */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col transition-all duration-300 hover:border-zinc-700">
            <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg w-fit mb-4"><Palette className="w-5 h-5 text-white" /></div>
            <h3 className="text-sm font-bold text-white mb-1">Character sets</h3>
            <p className="text-xs text-zinc-400 mb-3">Pick how brightness maps to text</p>
            <div className="grid grid-cols-2 gap-2">
              {charsets.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedSet(idx)}
                  className={cn("p-2 rounded-lg border text-left transition-all duration-200", selectedSet === idx ? "bg-zinc-800 border-zinc-600" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700")}
                >
                  <p className="text-[10px] text-zinc-400">{c.name}</p>
                  <p className="font-mono text-[10px] text-emerald-400 truncate mt-0.5">{c.ramp}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Code card */}
          <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col transition-all duration-300 hover:border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg"><Terminal className="w-5 h-5 text-white" /></div>
              <h3 className="text-sm font-bold text-white">How it works</h3>
            </div>
            <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-[12px] leading-relaxed overflow-auto scrollbar-hide">
              {codeExample.split("\n").map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-600 select-none w-6 text-right">{idx + 1}</span>
                  <span className={cn(line.includes("//") ? "text-zinc-600" : line.includes("✓") ? "text-emerald-400" : "text-zinc-300")}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-all duration-300 hover:border-zinc-700">
                <Icon className="w-4 h-4 text-white mb-3" />
                <p className="text-xs text-zinc-400">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>
        <p className="flex items-center gap-2 text-xs text-zinc-500"><Lock className="w-3.5 h-3.5" /> Every frame is processed on your device with the Canvas API.</p>
      </div>
    </section>
  );
};

export default Component;
