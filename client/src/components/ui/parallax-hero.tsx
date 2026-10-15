import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ParallaxLayer {
  src: string;
  alt: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  distance: number;
  className?: string;
  zIndex: number;
  initialTop: string;
  initialLeft: string;
  width: string;
}

interface ParallaxHeroProps {
  layers?: ParallaxLayer[];
  title?: string;
  className?: string;
}

const CDN = "https://cdn.21st.dev/assets/mirror/";
// helper keeps the layer table compact: [path, alt, sx, sy, sz, rot, dist, z, top, left, width, className?]
const L = (
  p: string, alt: string, speedX: number, speedY: number, speedZ: number, rotation: number,
  distance: number, zIndex: number, initialTop: string, initialLeft: string, width: string, className?: string
): ParallaxLayer => ({ src: CDN + p, alt, speedX, speedY, speedZ, rotation, distance, zIndex, initialTop, initialLeft, width, className });

const defaultLayers: ParallaxLayer[] = [
  L("bf/bfb8ca258f591d2b7388d05d79ac2332b695867281627c1bc8c7165ca6429a6d.png", "background", 0.03, 0.038, 0, 0, -200, 1, "calc(50% - 50px)", "calc(50% + 0px)", "3200px"),
  L("c8/c878e14d1f8e481f6f70b31fb01de352338db5353f5b8852a241062bb251b558.png", "fog-7", 0.27, 0.32, 0, 0, 850, 2, "calc(50% - 100px)", "calc(50% + 300px)", "1900px"),
  L("e9/e94a2247aa54feee12cd1580a7c3abf97d6f55bbe7e50006d8dda6e4dffbe921.png", "mountain-10", 0.095, 0.005, 0, 0, 1110, 3, "calc(50% + 169px)", "calc(50% + 330px)", "1200px"),
  L("99/9955626de3f10d97d27b7b89f7be180c02e1700f288db28e0c6824142871523f.png", "fog-6", 0.25, 0.28, 0, 0, 1400, 4, "calc(50% + 285px)", "calc(50%)", "2200px", "opacity-30"),
  L("dd/dd999609be149c46fcb65fce4d267cad8d5651b0c31901b399054da5146cb46e.png", "mountain-9", 0.125, 0.155, 0.15, 0.02, 1700, 51, "calc(50% + 313px)", "calc(50% - 557px)", "670px"),
  L("d5/d579e64ddeb3a32d04dff5391980b827eb4d6d4aafa2cc3231e2cbe02d66a7c7.png", "fog-5", 0.16, 0.105, 0, 0, 1900, 7, "calc(50% + 360px)", "calc(50% + 40px)", "650px"),
  L("b7/b74be54427fd5b9568571ba97684bc8a4334d366a3f3b32c353d31fd1501c09b.png", "mountain-7", 0.1, 0.1, 0, 0.09, 2000, 19, "calc(50% + 223px)", "calc(50% + 495px)", "738px"),
  L("ed/edf306a4225b6188283aa94ecec1553b2e0855038a3acaed402001f38c64af1d.png", "mountain-6", 0.065, 0.05, 0.05, 0.12, 2300, 18, "calc(50% + 120px)", "calc(50% + 590px)", "408px"),
  L("8d/8d12582b7eac71f981eca3a8bb19157fb57fc4b05c14f9ef80fd029e5fecfab5.png", "fog-4", 0.135, 0.1, 0, 0, 2400, 11, "calc(50% + 223px)", "calc(50% + 460px)", "590px", "opacity-50"),
  L("9c/9c1a1b7f4b165011788c27d440d920e407d70f148cbc9a01eacfecb49126efcb.png", "mountain-5", 0.08, 0.05, 0.13, 0.1, 2550, 12, "calc(50% + 320px)", "calc(50% + 230px)", "725px"),
  L("0e/0e7888cc6d1732222b5c1f38b925cf1ecdb7fec02fd1193dd1cfef280a453c5a.png", "fog-3", 0.11, 0.018, 0, 0, 2800, 113, "calc(50% + 210px)", "calc(50% + 5px)", "1600px"),
  L("fa/fa0946f924ad025b207616cfe20ce022bcccd22ac9db4038a584ace23b7d9721.png", "mountain-4", 0.059, 0.024, 0.35, 0.14, 3200, 15, "calc(50% + 196px)", "calc(50% - 698px)", "1100px"),
  L("90/90863919566208c1eb7a78136d1dd493dd402f4d5a5efe2fc890a288a6b07449.png", "mountain-3", 0.04, 0.018, 0.32, 0.05, 3400, 20, "calc(50% - 20px)", "calc(50% + 750px)", "630px"),
  L("b2/b2d0ba5c7f17d038a04475b8f36563aea22cfee00983db3b5477f1ac4c9a5097.png", "fog-2", 0.15, 0.0115, 0, 0, 3600, 16, "calc(50% - 20px)", "calc(50% + 698px)", "1100px"),
  L("c4/c4ae700b3a0070eae9f3c005a17572ae68fcb8373d322f279d28c5bf19cd501d.png", "mountain-2", 0.0235, 0.013, 0.42, 0.15, 3800, 17, "calc(50% + 256px)", "calc(50% + 528px)", "800px"),
  L("41/414097ad4507410ac1dc884afcc92bb3f4f45763fd17b2986bf82dd43c31da97.png", "mountain-1", 0.027, 0.018, 0.53, 0.2, 4000, 18, "calc(50% + 196px)", "calc(50% - 728px)", "1100px"),
  L("aa/aa8ace86d9779fcccce3a1a28b8ac0cb86336b5980706659f2c8889c3daaf5a1.png", "fog-1", 0.12, 0.01, 0, 0, 4200, 21, "calc(100% - 355px)", "calc(50% + 100px)", "1900px", "opacity-50"),
];

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ layers = defaultLayers, title = "HERO", className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLayers = (cursorPosition: number, xVal: number, yVal: number, rotateDeg: number) => {
      layerRefs.current.forEach((el, index) => {
        if (!el) return;
        const { speedX, speedY, speedZ, rotation } = layers[index];
        const computedLeft = parseFloat(getComputedStyle(el).left.replace("px", ""));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;
        el.style.transform = `perspective(2300px) translateZ(${zValue * speedZ}px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${-xVal * speedX}px)) translateY(calc(-50% + ${yVal * speedY}px))`;
      });

      if (textRef.current) {
        const textSpeedX = 0.07, textSpeedY = 0.05, textSpeedZ = 0.08, textRotation = 0.04;
        const computedLeft = parseFloat(getComputedStyle(textRef.current).left.replace("px", ""));
        const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
        const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;
        textRef.current.style.transform = `perspective(2300px) translateZ(${zValue * textSpeedZ}px) rotateY(${rotateDeg * textRotation}deg) translateX(calc(-50% + ${-xVal * textSpeedX}px)) translateY(calc(-50% + ${yVal * textSpeedY}px))`;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      updateLayers(e.clientX, x, y, (x / (window.innerWidth / 2)) * 20);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [layers]);

  return (
    <main
      ref={containerRef}
      className={cn("relative h-screen w-screen overflow-hidden bg-gradient-to-b from-sky-1900 to-sky-1700", className)}
    >
      <div className="absolute inset-0 z-[100] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_65%,rgba(0,0,0,0.7))]" />

      {layers.map((layer, index) => (
        <img
          key={index}
          ref={(el) => { layerRefs.current[index] = el; }}
          src={layer.src}
          alt={layer.alt}
          className={cn("absolute pointer-events-none transition-transform duration-[450ms] ease-out", layer.className)}
          style={{ width: layer.width, top: layer.initialTop, left: layer.initialLeft, zIndex: layer.zIndex, transform: "translate(-50%, -50%)" }}
        />
      ))}

      <div
        ref={textRef}
        className="absolute z-[9] text-white text-center pointer-events-auto transition-transform duration-[450ms] ease-out"
        style={{ top: "calc(50% - 130px)", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <h1 className="font-black text-[20rem] leading-[0.8] max-lg:text-[15rem] max-md:text-[5.8rem] max-sm:text-[3.3rem]">
          {title}
        </h1>
      </div>
    </main>
  );
};

export default function ParallaxHeroDemo() {
  return <ParallaxHero />;
}
