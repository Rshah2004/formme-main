import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, CheckCircle2, Clock } from "lucide-react";
import BookDemoModal from "@/components/homePage/BookDemoModal";

type UserRole = "designer" | "manufacturer";
type AuthMode = "signin" | "signup" | "verify-email" | "reset-password" | "request-submitted";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [userRole, setUserRole] = useState<UserRole>("designer");
  const [showBookDemo, setShowBookDemo] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

useEffect(() => {
  if (!window.location.hash) return;

  const normalized = window.location.hash
    .substring(1)
    .replace(/#/g, "&");

  const params = new URLSearchParams(normalized);

  const type = params.get("type");
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (type === "recovery" && accessToken && refreshToken) {
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    setMode("reset-password");
  }

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("reset-password");
      }
    });

  return () => subscription.unsubscribe();
}, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    companyName: "",
    location: "",
    phone: "",
    moq: "",
    leadTime: "",
    capabilities: [] as string[],
    categories: [] as string[],
    brandDescription: "",
    brandUrl: "",
    annualVolumeRange: "",
    budgetRange: "",
    portfolioUrls: "",
    shippingStreet: "",
    shippingCity: "",
    shippingState: "",
    shippingPostal: "",
    shippingCountry: "",
  });

  const capabilitiesOptions = [
    "Cut & Sew",
    "Printing",
    "Embroidery",
    "Dyeing",
    "Pattern Making",
    "Sampling",
    "Quality Control",
    "Packaging"
  ];

  const categoriesOptions = [
    "T-Shirts",
    "Hoodies",
    "Pants",
    "Dresses",
    "Jackets",
    "Activewear",
    "Underwear",
    "Accessories"
  ];

  const annualVolumeOptions = [
    "Under 500",
    "500-2,000",
    "2,000-10,000",
    "10,000+"
  ];

  const budgetRangeOptions = [
    "Under $5k",
    "$5k-$15k",
    "$15k-$50k",
    "$50k+"
  ];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (roleData?.role === "manufacturer") {
        navigate("/manufacturer");
      } else {
        navigate("/dashboard");
      }

      toast.success("Signed in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth#type=recovery`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) {
    toast.error("Invalid or expired password reset link");
    return;
  }

  if (newPassword !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  if (newPassword.length < 6) {
    toast.error("Password must be at least 6 characters");
    return;
  }

  setIsLoading(true);
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    toast.success("Password updated successfully!");
    setMode("signin");
    setNewPassword("");
    setConfirmPassword("");
    window.history.replaceState(null, "", window.location.pathname);
  } catch (error: any) {
    toast.error(error.message || "Failed to reset password");
  } finally {
    setIsLoading(false);
  }
};

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const portfolioUrls = formData.portfolioUrls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      const metadata: Record<string, any> = {
        full_name: formData.fullName,
        company_name: formData.companyName || null,
        role: userRole,
      };

      if (userRole === "designer") {
        metadata.brand_description = formData.brandDescription || null;
        metadata.brand_url = formData.brandUrl || null;
        metadata.primary_category = formData.categories[0] || null;
        metadata.categories = formData.categories;
        metadata.annual_volume_range = formData.annualVolumeRange || null;
        metadata.budget_range = formData.budgetRange || null;
        metadata.portfolio_urls = portfolioUrls;
        metadata.shipping_street = formData.shippingStreet;
        metadata.shipping_city = formData.shippingCity;
        metadata.shipping_state = formData.shippingState;
        metadata.shipping_postal = formData.shippingPostal;
        metadata.shipping_country = formData.shippingCountry;
      }

      // Direct signup - create account immediately
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      const userId = data.user?.id;
      const hasSession = !!data.session;

      if (userId && hasSession) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: userRole });

        if (roleError && roleError.code !== "23505") {
          console.error("Role insert error:", roleError);
        }

        const profileUpdate: Record<string, any> = {
          full_name: formData.fullName || null,
          company_name: formData.companyName || null,
          phone: formData.phone || null,
          location: formData.location || null,
          moq: formData.moq ? parseInt(formData.moq, 10) : null,
          lead_time: formData.leadTime ? parseInt(formData.leadTime, 10) : null,
          capabilities: formData.capabilities.length ? formData.capabilities : null,
          categories: formData.categories.length ? formData.categories : null,
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", userId);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        if (userRole === "manufacturer") {
          const manufacturerName = (formData.companyName || formData.fullName || "").trim();
          const { error: manufacturerError } = await supabase
            .from("manufacturers")
            .insert({
              user_id: userId,
              name: manufacturerName || "Manufacturer",
              location: formData.location || null,
              min_order_quantity: formData.moq ? parseInt(formData.moq, 10) : null,
              lead_time_days: formData.leadTime ? parseInt(formData.leadTime, 10) : null,
              specialties: formData.capabilities.length ? formData.capabilities : null,
              categories: formData.categories.length ? formData.categories : null,
            });

          if (manufacturerError && manufacturerError.code !== "23505") {
            console.error("Manufacturer insert error:", manufacturerError);
          }
        }
      } else if (userId && !hasSession) {
        toast.info("Please verify your email, then sign in to finish profile setup.");
      }

      toast.success("Account created! You can now sign in.");
      setMode("signin");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-2xl p-8 bg-white/70 backdrop-blur-md border border-border/40 shadow-lg rounded-2xl">
        
        {/* Verify Email Screen */}
        {mode === "verify-email" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={() => setMode("signin")}
              className="mr-2"
            >
              Back to Sign In
            </Button>
          </div>
        )}

        {/* Request Submitted Screen */}
        {mode === "request-submitted" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#C8956C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#C8956C]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Request Submitted</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thank you for your interest in joining Formme! Our team will review your request and reach out to <strong>{formData.email}</strong> shortly.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              We typically respond within 1-2 business days.
            </p>
            <Button
              variant="outline"
              onClick={() => setMode("signin")}
            >
              Back to Sign In
            </Button>
          </div>
        )}

        {/* Reset Password Screen */}
        {mode === "reset-password" && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Set new password</h1>
              <p className="text-muted-foreground">
                Enter your new password below
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl" 
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        )}

        {/* Sign In / Sign Up Tabs */}
        {(mode === "signin" || mode === "signup") && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2">formme</h1>
              <p className="text-muted-foreground">
                {mode === "signin" ? "Welcome back" : "Book a demo with our team"}
              </p>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)}>
              <div className="flex justify-center gap-8 mb-6 border-b border-border/30">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className={`pb-3 px-2 transition-all rounded-t-lg ${
                    mode === "signin"
                      ? "border-b-2 border-primary font-bold text-foreground bg-white/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`pb-3 px-2 transition-all rounded-t-lg ${
                    mode === "signup"
                      ? "border-b-2 border-primary font-bold text-foreground bg-white/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                  }`}
                >
                  Book a Demo
                </button>
              </div>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
              <Button type="submit" className="w-full h-11 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">I am a...</Label>
                <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUserRole("designer")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
                      userRole === "designer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-foreground border border-border/50 hover:bg-primary/5"
                    }`}
                  >
                    Brand
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRole("manufacturer")}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
                      userRole === "manufacturer"
                        ? "bg-primary text-primary-foreground"
                        : "bg-white text-foreground border border-border/50 hover:bg-primary/5"
                    }`}
                  >
                    Manufacturer
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/70 p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {userRole === "designer" ? "Book a demo for your brand" : "Book a demo for your manufacturing team"}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  We&apos;ll walk you through the platform, answer questions, and show how Formme fits your workflow.
                </p>
                <Button type="button" onClick={() => setShowBookDemo(true)} className="w-full mt-3 h-11 rounded-xl">
                  Book a Demo
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        </>
        )}
      </Card>
      </div>
      <BookDemoModal open={showBookDemo} onOpenChange={setShowBookDemo} />
      <Footer />
    </div>
  );
};

export default Auth;
