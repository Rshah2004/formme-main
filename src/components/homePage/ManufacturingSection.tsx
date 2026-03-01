import { Shield, Globe2, FlaskConical, Truck } from "lucide-react";

const badges = [
  { icon: Shield, label: "Verified compliance" },
  { icon: Globe2, label: "MOQ-friendly" },
  { icon: FlaskConical, label: "Sampling first" },
  { icon: Truck, label: "Global logistics" },
];

const stats = [
  { value: "7+", label: "Manufacturers" },
  { value: "50M+", label: "Annual Capacity" },
  { value: "30–150", label: "Average MOQ" },
  { value: "3–6 wks", label: "Lead Time" },
];

const categories = ["Cut & sew", "Knits", "Athleisure", "Intimates", "Outerwear", "Denim"];
const capabilities = ["Tech pack review", "Sampling", "Grading", "Embroidery & print", "QC checkpoints", "Compliance"];

const ManufacturingSection = () => {
  return (
    <section id="manufacturing-section" className="bg-transparent pt-10 md:pt-12 pb-20 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative bg-gradient-to-r from-[#2F3E35] via-[#3C5A4B] to-[#2F3E35] text-primary-foreground rounded-3xl p-10 md:p-14 shadow-[0_36px_90px_rgba(0,0,0,0.24)] w-full max-w-[1840px] mx-auto">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-transparent to-[#2F3E35] pointer-events-none rounded-t-3xl" />
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">
            Manufacturing Network
          </p>
          <h2
            className="text-3xl md:text-5xl font-serif leading-tight mb-6 max-w-3xl"
            style={{ textShadow: "0 8px 24px rgba(0,0,0,0.18)" }}
          >
            Production strength, without direct factory contact
          </h2>
          <p className="text-primary-foreground/60 max-w-xl mb-10 leading-relaxed">
            Assess fit without reaching suppliers directly. We protect the relationship while showing full capability.
          </p>

          <div className="flex flex-wrap gap-3 mb-16">
            {badges.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 border border-primary-foreground/20 rounded-full px-4 py-2 text-sm text-primary-foreground/80"
              >
                <b.icon className="w-4 h-4" /> {b.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-serif">{s.value}</p>
                <p className="text-sm text-primary-foreground/40 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <hr className="border-primary-foreground/10 mb-12" />

          <p className="text-primary-foreground/40 text-sm mb-10 max-w-xl">
            Factories in our network have produced for brands such as Old Navy, US Polo, Fanatics, Jack & Jones, and Bestseller.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/30 mb-4">
                Categories Produced
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span
                    key={c}
                    className="border border-primary-foreground/20 rounded-full px-4 py-1.5 text-sm text-primary-foreground/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary-foreground/30 mb-4">
                Capabilities
              </p>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((c) => (
                  <span
                    key={c}
                    className="border border-primary-foreground/20 rounded-full px-4 py-1.5 text-sm text-primary-foreground/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManufacturingSection;
