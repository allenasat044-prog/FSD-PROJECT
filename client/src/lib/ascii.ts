export const CHARSETS = {
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  binary: " 01",
  matrix: " ｦｧｨｩｪｫｬｭｮｯ012345789",
} as const;
export type CharsetKey = keyof typeof CHARSETS;
export type Mode = "green" | "amber" | "color";

export interface Settings {
  cols: number;
  contrast: number;
  brightness: number;
  charset: CharsetKey;
  mode: Mode;
  invert: boolean;
  mirror: boolean;
}

export interface Frame {
  rows: string[];
  data: Uint8ClampedArray;
  cols: number;
  rowCount: number;
  mode: Mode;
}

export type Source = HTMLVideoElement | HTMLImageElement;
export const CW = 6; // cell width (px)
export const CH = 12; // cell height (px)

export function sourceSize(src: Source): [number, number] {
  return src instanceof HTMLVideoElement ? [src.videoWidth, src.videoHeight] : [src.naturalWidth, src.naturalHeight];
}

/** Sample the source into a small canvas, map brightness to characters and paint them on `out`. */
export function renderAscii(src: Source, cols: number, s: Settings, off: HTMLCanvasElement, out: HTMLCanvasElement): Frame | null {
  const [w, h] = sourceSize(src);
  if (!w || !h) return null;
  const rowCount = Math.max(1, Math.round((cols * h * CW) / (w * CH)));
  off.width = cols;
  off.height = rowCount;
  const octx = off.getContext("2d", { willReadFrequently: true })!;
  octx.save();
  if (s.mirror) { octx.translate(cols, 0); octx.scale(-1, 1); }
  octx.drawImage(src, 0, 0, cols, rowCount);
  octx.restore();
  const d = octx.getImageData(0, 0, cols, rowCount).data;

  const set: string = CHARSETS[s.charset];
  const n = set.length - 1;
  out.width = cols * CW;
  out.height = rowCount * CH;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.font = `${CH - 1}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textBaseline = "top";
  ctx.fillStyle = s.mode === "amber" ? "#ffb000" : "#33ff66";

  const perChar = s.mode === "color" || s.charset === "matrix";
  const rows: string[] = [];
  for (let y = 0; y < rowCount; y++) {
    let row = "";
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
      l = (l - 0.5) * s.contrast + 0.5 + s.brightness;
      l = l < 0 ? 0 : l > 1 ? 1 : l;
      if (s.invert) l = 1 - l;
      const ch = set[Math.round(l * n)];
      row += ch;
      if (perChar && ch !== " ") {
        if (s.mode === "color") ctx.fillStyle = `rgb(${d[i]},${d[i + 1]},${d[i + 2]})`;
        ctx.fillText(ch, x * CW, y * CH);
      }
    }
    if (!perChar) ctx.fillText(row, 0, y * CH);
    rows.push(row);
  }
  return { rows, data: d, cols, rowCount, mode: s.mode };
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function frameToSvg(f: Frame): string {
  const fill = f.mode === "amber" ? "#ffb000" : "#33ff66";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.cols * CW}" height="${f.rowCount * CH}"><rect width="100%" height="100%" fill="#000"/><g font-family="monospace" font-size="${CH - 1}" xml:space="preserve" fill="${fill}">`;
  f.rows.forEach((row, y) => {
    if (f.mode === "color") {
      let t = "";
      for (let x = 0; x < f.cols; x++) {
        const ch = row[x];
        if (ch === " ") continue;
        const i = (y * f.cols + x) * 4;
        t += `<tspan x="${x * CW}" fill="rgb(${f.data[i]},${f.data[i + 1]},${f.data[i + 2]})">${esc(ch)}</tspan>`;
      }
      s += `<text y="${(y + 1) * CH - 2}">${t}</text>`;
    } else {
      s += `<text x="0" y="${(y + 1) * CH - 2}" textLength="${f.cols * CW}" lengthAdjust="spacing">${esc(row)}</text>`;
    }
  });
  return s + "</g></svg>";
}

export function saveBlob(name: string, blob: Blob) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
