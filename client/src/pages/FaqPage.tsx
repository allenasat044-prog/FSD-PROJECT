import { useEffect, useState } from "react";
import Faqs02, { type FaqItem } from "@/components/ui/faqs-02";
import TeamSection from "@/components/TeamSection";
import { api } from "@/lib/api";

// FAQs live in MongoDB (seeded on first start) and are served by GET /api/faqs.
export default function FaqPage() {
  const [items, setItems] = useState<FaqItem[] | undefined>(undefined); // undefined -> component's built-in defaults
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.faqs()
      .then((r) => r.length && setItems(r))
      .catch(() => {}) // API offline: keep the defaults
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-12">
      <Faqs02 faqs={items} loading={loading} />
      <TeamSection />
    </div>
  );
}
