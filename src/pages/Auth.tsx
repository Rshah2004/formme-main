import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Mail, CheckCircle2 } from "lucide-react";

type UserRole = "designer" | "manufacturer";
type AuthMode = "signin" | "signup" | "verify-email" | "reset-password";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [userRole, setUserRole] = useState<UserRole>("designer");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check for recovery token in URL hash on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (type === "recovery" && accessToken) {
      setMode("reset-password");
    }
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
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
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setMode("signin");
      setNewPassword("");
      setConfirmPassword("");
      // Clear the hash from URL
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
      // Pass role in user metadata - the database trigger will handle role assignment
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
            role: userRole, // This is read by the handle_new_user trigger
          },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error("Signup failed");

      console.log("User created:", data.user.id);
      console.log("Role will be assigned by database trigger:", userRole);

      // Note: Role and basic profile are created by the database trigger (handle_new_user)
      // We only need to update the profile with additional manufacturer-specific data if needed

      // Show verify email screen
      setMode("verify-email");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to sign up");
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
                {mode === "signin" ? "Welcome back" : "Join our community"}
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
                  Sign Up
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
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3">
              {/* Role Selection */}
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
                    Designer
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

              {/* Personal Information */}
              <div className="pt-1">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Personal Information</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="signup-fullName" className="text-sm">Full Name</Label>
                    <Input
                      id="signup-fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="pt-1">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Company Info</h3>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="signup-companyName" className="text-sm">Company Name</Label>
                    <Input
                      id="signup-companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-sm">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-sm">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              {userRole === "manufacturer" && (
                <>
                  {/* Additional Info */}
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Additional Information</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="signup-location" className="text-sm">Location</Label>
                        <Input
                          id="signup-location"
                          type="text"
                          placeholder="City, Country"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="signup-phone" className="text-sm">Phone</Label>
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Production Details */}
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Production Details</h3>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="signup-moq" className="text-sm">Min Order Qty</Label>
                        <Input
                          id="signup-moq"
                          type="number"
                          placeholder="100"
                          value={formData.moq}
                          onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-leadTime" className="text-sm">Lead Time (days)</Label>
                        <Input
                          id="signup-leadTime"
                          type="number"
                          placeholder="30"
                          value={formData.leadTime}
                          onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Capabilities</Label>
                        <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-md bg-background">
                          {capabilitiesOptions.map((capability) => (
                            <div key={capability} className="flex items-center space-x-2">
                              <Checkbox
                                id={`capability-${capability}`}
                                checked={formData.capabilities.includes(capability)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormData({
                                      ...formData,
                                      capabilities: [...formData.capabilities, capability]
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      capabilities: formData.capabilities.filter((c) => c !== capability)
                                    });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`capability-${capability}`}
                                className="text-sm cursor-pointer"
                              >
                                {capability}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Categories</h3>
                    <div className="grid grid-cols-2 gap-2 p-3 border border-border rounded-md bg-background">
                      {categoriesOptions.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={formData.categories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  categories: [...formData.categories, category]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  categories: formData.categories.filter((c) => c !== category)
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${category}`}
                            className="text-sm cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full mt-3 h-11 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                className="w-full h-11 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        </>
        )}
      </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
