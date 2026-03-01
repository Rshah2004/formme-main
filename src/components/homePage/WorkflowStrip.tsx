const steps = [
  { name: "Tech Pack", constraint: "Specs, BOM required" },
  { name: "Review", constraint: "Factory feasibility check" },
  { name: "Sampling", constraint: "1–2 iterations typical" },
  { name: "Approval", constraint: "Specs locked" },
  { name: "Production", constraint: "Milestones tracked" },
];

const WorkflowStrip = () => {
  return (
    <section className="bg-transparent py-6">
      <div className="container mx-auto px-6">
        <div className="w-full bg-white rounded-xl shadow-[0_22px_50px_rgba(0,0,0,0.16)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-[#344C3D]/10">
            {steps.map((step) => (
              <div
                key={step.name}
                className="px-4 py-3 text-left hover:bg-[#344C3D]/5 transition-colors"
              >
                <p className="text-xs font-semibold tracking-wide text-[#344C3D] mb-1">
                  {step.name}
                </p>
                <p className="text-[11px] text-[#344C3D]/60 leading-snug">
                  {step.constraint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkflowStrip;
