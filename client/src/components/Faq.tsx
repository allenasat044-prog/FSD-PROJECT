import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const fallback = [
  { _id: "1", question: "Is my camera feed or file uploaded anywhere?", answer: "No. Every frame is converted on your device. Only art you choose to save is sent to the server." },
  { _id: "2", question: "Why won't my camera start?", answer: "Camera access needs https or localhost and your permission. Use the Video or Image tabs if it is blocked." },
];

export default function Faq() {
  const [items, setItems] = useState(fallback);
  useEffect(() => { api.faqs().then((r) => r.length && setItems(r)).catch(() => {}); }, []); // FAQs come from MongoDB via GET /api/faqs

  return (
    <section id="faq" className="bg-black px-4 py-24 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">Frequently asked questions</h2>
        <p className="mb-10 text-zinc-400">Quick answers before you start.</p>
        <div className="flex flex-col gap-3">
          {items.map((i) => (
            <details key={i._id} className="group rounded-xl border border-zinc-800 bg-zinc-950 px-5 open:border-zinc-700">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
                {i.question}
                <span className="text-xl text-emerald-400 group-open:hidden">+</span>
                <span className="hidden text-xl text-emerald-400 group-open:inline">–</span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-zinc-400">{i.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
