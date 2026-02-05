import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Palette, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

const NewDesign = () => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [designName, setDesignName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const categoryOptions = [
    "T-Shirts",
    "Pants",
    "Jackets",
    "Underwear",
    "Hoodies",
    "Dresses",
    "Activewear",
    "Accessories",
  ];

  const handleCategoryToggle = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleUploadDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designName) {
      toast.error("Please provide a design name");
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      console.log("Current user:", user.id);

      // Check if user has designer role
      const { data: roleCheck, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      console.log("User role check:", roleCheck, roleError);

      if (roleError || !roleCheck) {
        toast.error("User role not found. Please try signing out and back in.");
        console.error("Role check failed:", roleError);
        return;
      }

      if (roleCheck.role !== 'designer') {
        toast.error("Only designers can create designs");
        return;
      }

      // Insert design record
      const { data: design, error: designError } = await supabase
        .from("designs")
        .insert({
          user_id: user.id,
          name: designName,
          category: categories.join(", "),
          status: 'draft',
        })
        .select()
        .single();

      if (designError) {
        console.error("Design insert error:", designError);
        throw designError;
      }

      console.log("Design created:", design);

      // Create design_specs for this design
      const { error: specsError } = await supabase
        .from("design_specs")
        .insert({
          design_id: design.id,
        });

      if (specsError) {
        console.error("Design specs error:", specsError);
        throw specsError;
      }

      // Create an order for this design to enter the workflow
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          designer_id: user.id,
          design_id: design.id,
          status: 'tech_pack_pending',
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      toast.success("Design created successfully!");
      // Start pipeline at upload tech pack
      navigate(`/workflow?designId=${design.id}&stage=upload-tech-pack`);
    } catch (error: any) {
      console.error("Full error details:", error);
      toast.error(error.message || "Failed to create design");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDesignClick = () => {
    setShowDialog(true);
  };

  const handleStudioSelect = (studio: string) => {
    setShowDialog(false);
    if (studio === 'pro') {
      navigate("/professional-studio");
    } else {
      navigate("/designer");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-8 pt-32">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">New Design</h1>
            <p className="text-muted-foreground">Create your design or upload an existing one</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Design your garment with Formme */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-l font-light ">Coming Soon</h3>
                <h2 className="text-2xl font-semibold mb-2">Design your garment with Formme</h2>
                <p className="text-muted-foreground">
                  Create your design from scratch using our design tools
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div>
                    <h3 className="font-medium">Professional Studio</h3>
                    <p className="text-sm text-muted-foreground">Advanced tools for professional designers</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3" />
                  </div>
                  <div>
                    <h3 className="font-medium">Basic Studio</h3>
                    <p className="text-sm text-muted-foreground">Quick and easy garment design with pre-made templates</p>
                  </div>
                </div>
              </div>

              {/* <Button onClick={handleNewDesignClick} className="w-full">
                Start Designing
              </Button> */}
            </Card>

            {/* Have a ready-to-manufacture design? */}
            <Card className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Have a ready-to-manufacture design?</h2>
                <p className="text-muted-foreground">
                  Upload your existing design and start the production process
                </p>
              </div>

              <form onSubmit={handleUploadDesign} className="space-y-4">
                <div>
                  <Label htmlFor="designName">Design Name *</Label>
                  <Input
                    id="designName"
                    value={designName}
                    onChange={(e) => setDesignName(e.target.value)}
                    placeholder="Summer Collection Tee"
                    required
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Categories</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryOptions.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${cat}`}
                          checked={categories.includes(cat)}
                          onCheckedChange={() => handleCategoryToggle(cat)}
                        />
                        <label
                          htmlFor={`category-${cat}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {cat}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload & Start Production Pipeline"}
                </Button>
              </form>
            </Card>
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <Footer />

      {/* Studio Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Your Studio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Button 
              onClick={() => handleStudioSelect('pro')} 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-semibold">Professional Studio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced tools for professional designers
              </p>
            </Button>
            <Button 
              onClick={() => handleStudioSelect('basic')} 
              variant="outline" 
              className="w-full h-auto py-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Basic Studio</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Quick and easy garment design with pre-made templates
              </p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewDesign;
