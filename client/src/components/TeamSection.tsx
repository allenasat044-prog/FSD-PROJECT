import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";

interface Member {
  name: string;
  role: string;
  work: string;
  github: string; // username
}

const TEAM: Member[] = [
  { name: "Shashank Patel", role: "Backend — API", work: "Server setup, REST endpoints, controllers, middleware, validation, error handling", github: "allenasat044-prog" },
  { name: "Rishu Gupta", role: "Backend — Database", work: "Schema design, Mongoose models, CRUD queries, indexes, data relationships", github: "vampire0011" },
  { name: "Pankaj Pandurang Tike", role: "Frontend", work: "UI, components, routing, state management, API integration on the client", github: "pankajt25" },
  { name: "Priyanshu Kumar", role: "Auth & Integration", work: "JWT auth, connecting frontend with backend, API testing, bug fixing, hosting", github: "Priyanshu1115" },
];

const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function Avatar({ m }: { m: Member }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-foreground text-sm font-semibold text-background">{initials(m.name)}</span>
  ) : (
    <img src={`https://github.com/${m.github}.png?size=120`} alt={m.name} loading="lazy" onError={() => setFailed(true)} className="size-14 shrink-0 rounded-full border border-border object-cover" />
  );
}

export default function TeamSection() {
  return (
    <section className="bg-background pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-10 flex flex-col gap-4 border-t border-border pt-16">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm shadow-black/5">
            Dev team
          </span>
          <h2 className="text-balance font-semibold tracking-tight" style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.25rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Meet the team
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground">The four developers who built ASCII_CAM. Say hi or browse the code on GitHub.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEAM.map((m) => (
            <a key={m.github} href={`https://github.com/${m.github}`} target="_blank" rel="noreferrer noopener"
              className="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-muted-foreground/50">
              <Avatar m={m} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium text-foreground">{m.name}</h3>
                    <p className="text-xs font-medium text-emerald-400">{m.role}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{m.work}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Github className="size-3" /> @{m.github}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
