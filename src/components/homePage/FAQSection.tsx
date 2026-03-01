import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Who is Formme for?",
    a: "Formme is for emerging brands, small, medium, and large labels, as well as companies producing merch.",
  },
  {
    q: "How does Formme help?",
    a: "We help brands stay focused on design while we handle logistics, supplier coordination, sampling, approvals, production tracking, and delivery—so you move faster without losing control.",
  },
  {
    q: "How does manufacturer selection work?",
    a: "You can pick from our list using the Find My Match algorithm, which scores factories based on your requirements, or have us select the best fit for you.",
  },
  {
    q: "Do you work with small runs and flexible MOQs?",
    a: "Yes. We match you to factories that fit your target MOQ and product category.",
  },
  {
    q: "Will I need to contact factories directly?",
    a: "No. We handle introductions, sampling coordination, and production tracking within the platform.",
  },
  {
    q: "How do you verify manufacturers?",
    a: "Factories are vetted for compliance, capacity, and proven production history before they’re listed.",
  },
  {
    q: "Can I use my existing manufacturer?",
    a: "Yes. You can invite your factory and manage the workflow in Formme.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-3">FAQ</p>
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">
              Common questions, answered clearly.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Quick clarity on how Formme works from first sample to final delivery.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-border/60 bg-white/90 shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 text-left px-5 md:px-6 py-2 md:py-2.5"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base md:text-lg font-semibold text-foreground leading-tight flex-1">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-muted-foreground transition-all duration-300 ${
                      isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {item.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
