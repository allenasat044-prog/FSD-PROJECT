import { ArrowRight, Clock, Mail, MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

// Used when the API has no FAQs yet (or can't be reached).
const defaultFaqs: FaqItem[] = [
  {
    question: "Is my camera feed or file uploaded anywhere?",
    answer: "No. Every frame is converted on your device with the Canvas API. Only art you choose to save is sent to the server.",
  },
  {
    question: "Why won't my camera start?",
    answer: "Camera access needs a secure context (https or localhost) and your permission. If it is blocked, use the Video or Image tabs instead.",
  },
];

const SUPPORT_EMAIL = "hello@ascii-cam.dev"; // <- change to your real address

export default function Faqs02({
  faqs = defaultFaqs,
  loading = false,
}: {
  faqs?: FaqItem[];
  loading?: boolean;
}) {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="lg:sticky lg:top-24 flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm shadow-black/5">
              FAQs
            </span>
            <h1
              className="text-balance font-semibold tracking-tight"
              style={{
                fontSize: "clamp(1.85rem, 4vw, 2.75rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              Your questions answered
            </h1>
            <p className="text-sm text-muted-foreground">
              Quick answers from the team. Still stuck? Write to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and a real person replies.
            </p>

            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background">
                  <MessageCircle className="size-4" />
                </span>
                <div className="flex flex-col leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    Talk to a human
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Clock className="mr-1.5 inline size-3" />
                    Replies in &lt; 4h
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="mt-2 w-full rounded-full">
                <a href={`mailto:${SUPPORT_EMAIL}?subject=ASCII_CAM%20question`}>
                  Open a ticket
                  <ArrowRight className="ml-1 size-4" />
                </a>
              </Button>
              <p className="text-center text-[11px] text-muted-foreground">
                <Mail className="mr-1 inline size-3" />
                Or email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4" aria-busy="true">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-card" />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible>
              {faqs.map((f, i) => (
                <AccordionItem key={f._id ?? f.question} value={`item-${i}`}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </section>
  );
}
