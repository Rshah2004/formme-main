import Navbar from "@/components/Navbar";
import HoodieFrontEditor from "@/components/test/HoodieFrontEditor";

const Test = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <section className="mb-8 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Product Customization MVP
          </p>
          <h1 className="heading-section not-italic">Hoodie Design Placement Editor</h1>
          <p className="max-w-3xl text-muted-foreground">
            This page uses hoodie front and back mockups as preview only. Placement is stored in normalized
            print-area coordinates and converted into side-specific garment-relative manufacturer measurements.
          </p>
        </section>

        <HoodieFrontEditor />
      </main>
    </div>
  );
};

export default Test;
