import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Profile {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  brand_description?: string | null;
  brand_url?: string | null;
  primary_category?: string | null;
  categories?: string[] | null;
  annual_volume_range?: string | null;
  budget_range?: string | null;
  portfolio_urls?: string[] | null;
  shipping_street?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_postal?: string | null;
  shipping_country?: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    company_name: "",
    phone: "",
    brand_description: "",
    brand_url: "",
    primary_category: "",
    categories: [],
    annual_volume_range: "",
    budget_range: "",
    portfolio_urls: [],
    shipping_street: "",
    shipping_city: "",
    shipping_state: "",
    shipping_postal: "",
    shipping_country: "",
  });
  const [emailDraft, setEmailDraft] = useState("");

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      setEmailDraft(user.email || "");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        const normalizeArray = (value: any) => {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          if (typeof value === "string") {
            return value.split(",").map((v) => v.trim()).filter(Boolean);
          }
          return [];
        };

        setProfile({
          full_name: profileData.full_name || "",
          company_name: profileData.company_name || "",
          phone: profileData.phone || "",
          brand_description: profileData.brand_description || "",
          brand_url: profileData.brand_url || "",
          primary_category: profileData.primary_category || "",
          categories: normalizeArray(profileData.categories),
          annual_volume_range: profileData.annual_volume_range || "",
          budget_range: profileData.budget_range || "",
          portfolio_urls: normalizeArray(profileData.portfolio_urls),
          shipping_street: profileData.shipping_street || "",
          shipping_city: profileData.shipping_city || "",
          shipping_state: profileData.shipping_state || "",
          shipping_postal: profileData.shipping_postal || "",
          shipping_country: profileData.shipping_country || "",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load profile");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
          brand_description: profile.brand_description,
          brand_url: profile.brand_url,
          primary_category: profile.primary_category,
          categories: profile.categories,
          annual_volume_range: profile.annual_volume_range,
          budget_range: profile.budget_range,
          portfolio_urls: profile.portfolio_urls,
          shipping_street: profile.shipping_street,
          shipping_city: profile.shipping_city,
          shipping_state: profile.shipping_state,
          shipping_postal: profile.shipping_postal,
          shipping_country: profile.shipping_country,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      if (emailDraft && emailDraft !== email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: emailDraft });
        if (emailError) throw emailError;
        toast.success("Email update requested. Please check your inbox to confirm.");
        setEmail(emailDraft);
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-8 pt-32">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account information</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Changing email will require confirmation.
              </p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                type="text"
                value={profile.company_name || ""}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="brandDescription">Brand Description</Label>
              <Textarea
                id="brandDescription"
                value={profile.brand_description || ""}
                onChange={(e) => setProfile({ ...profile, brand_description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="brandUrl">Brand Website</Label>
              <Input
                id="brandUrl"
                type="url"
                value={profile.brand_url || ""}
                onChange={(e) => setProfile({ ...profile, brand_url: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="primaryCategory">Primary Category</Label>
              <Input
                id="primaryCategory"
                type="text"
                value={profile.primary_category || ""}
                onChange={(e) => setProfile({ ...profile, primary_category: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="categories">Categories (comma separated)</Label>
              <Input
                id="categories"
                type="text"
                value={(profile.categories || []).join(", ")}
                onChange={(e) => setProfile({ ...profile, categories: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
              />
            </div>

            <div>
              <Label htmlFor="annualVolume">Annual Volume Range</Label>
              <Input
                id="annualVolume"
                type="text"
                value={profile.annual_volume_range || ""}
                onChange={(e) => setProfile({ ...profile, annual_volume_range: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="budgetRange">Budget Range</Label>
              <Input
                id="budgetRange"
                type="text"
                value={profile.budget_range || ""}
                onChange={(e) => setProfile({ ...profile, budget_range: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="portfolioUrls">Portfolio URLs (comma separated)</Label>
              <Input
                id="portfolioUrls"
                type="text"
                value={(profile.portfolio_urls || []).join(", ")}
                onChange={(e) => setProfile({ ...profile, portfolio_urls: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) })}
              />
            </div>

            <div className="pt-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>

            <div>
              <Label htmlFor="shippingStreet">Street</Label>
              <Input
                id="shippingStreet"
                type="text"
                value={profile.shipping_street || ""}
                onChange={(e) => setProfile({ ...profile, shipping_street: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shippingCity">City</Label>
                <Input
                  id="shippingCity"
                  type="text"
                  value={profile.shipping_city || ""}
                  onChange={(e) => setProfile({ ...profile, shipping_city: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingState">State</Label>
                <Input
                  id="shippingState"
                  type="text"
                  value={profile.shipping_state || ""}
                  onChange={(e) => setProfile({ ...profile, shipping_state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shippingPostal">Postal Code</Label>
                <Input
                  id="shippingPostal"
                  type="text"
                  value={profile.shipping_postal || ""}
                  onChange={(e) => setProfile({ ...profile, shipping_postal: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shippingCountry">Country</Label>
                <Input
                  id="shippingCountry"
                  type="text"
                  value={profile.shipping_country || ""}
                  onChange={(e) => setProfile({ ...profile, shipping_country: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
              <Button type="button" variant="destructive" onClick={handleSignOut} className="ml-auto">
                Sign Out
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
