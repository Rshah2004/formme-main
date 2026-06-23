import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';

const ADMIN_EMAIL = 'rythemshah2004@gmail.com';

function TagInput({ label, values, onChange, placeholder }: {
  label: string;
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  };

  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))}>
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function ManufacturerOnboard() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const [form, setForm] = useState({
    name: '',
    country: '',
    location: '',
    description: '',
    turnover: '',
    max_capacity: '',
    min_order_quantity: '',
    lead_time_days: '',
    price_range: '',
    specialties: [] as string[],
    categories: [] as string[],
    certifications: [] as string[],
    notable_brands: [] as string[],
    photo_urls: [] as string[],
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthorized(session?.user?.email === ADMIN_EMAIL);
    });
  }, []);

  const set = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country) {
      toast.error('Factory name and country are required');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('manufacturers').insert({
      name: form.name,
      country: form.country,
      location: form.location || null,
      description: form.description || null,
      max_capacity: form.max_capacity ? parseInt(form.max_capacity) : null,
      min_order_quantity: form.min_order_quantity ? parseInt(form.min_order_quantity) : null,
      lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days) : null,
      price_range: form.price_range || null,
      specialties: form.specialties.length ? form.specialties : null,
      categories: form.categories.length ? form.categories : null,
      certifications: form.certifications.length ? form.certifications : null,
      notable_brands: form.notable_brands.length ? form.notable_brands : null,
      photo_urls: form.photo_urls.length ? form.photo_urls : null,
      is_active: true,
    } as any);

    setSaving(false);

    if (error) {
      toast.error('Failed to save: ' + error.message);
    } else {
      toast.success('Factory added successfully!');
      navigate('/dashboard');
    }
  };

  if (authorized === null) return null;

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Add Factory</h1>
          <p className="text-muted-foreground mt-1">Fill in the factory profile. Takes about 10 minutes.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic Info */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Basic Info</h2>

            <div>
              <Label htmlFor="name" className="mb-2 block">Factory Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Supreme Group BD" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block">Country *</Label>
                <Select value={form.country} onValueChange={(v) => set('country', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                    <SelectItem value="Turkey">Turkey</SelectItem>
                    <SelectItem value="Portugal">Portugal</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="mb-2 block">City</Label>
                <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Dhaka" />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="2-3 sentences about the factory — what they do, what makes them stand out."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="turnover" className="mb-2 block">Annual Turnover</Label>
              <Input id="turnover" value={form.turnover} onChange={(e) => set('turnover', e.target.value)} placeholder="$50M" />
            </div>
          </section>

          {/* Capacity & Terms */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Capacity & Terms</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity" className="mb-2 block">Monthly Capacity (units)</Label>
                <Input id="capacity" type="number" value={form.max_capacity} onChange={(e) => set('max_capacity', e.target.value)} placeholder="1800000" />
              </div>
              <div>
                <Label htmlFor="moq" className="mb-2 block">MOQ (units)</Label>
                <Input id="moq" type="number" value={form.min_order_quantity} onChange={(e) => set('min_order_quantity', e.target.value)} placeholder="30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadtime" className="mb-2 block">Lead Time (days)</Label>
                <Input id="leadtime" type="number" value={form.lead_time_days} onChange={(e) => set('lead_time_days', e.target.value)} placeholder="30" />
              </div>
              <div>
                <Label htmlFor="price" className="mb-2 block">Price Range</Label>
                <Input id="price" value={form.price_range} onChange={(e) => set('price_range', e.target.value)} placeholder="$5–$15/unit" />
              </div>
            </div>
          </section>

          {/* What They Make */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">What They Make</h2>

            <TagInput
              label="Garment Categories"
              values={form.categories}
              onChange={(v) => set('categories', v)}
              placeholder="e.g. Hoodies, T-Shirts, Activewear — press Enter"
            />

            <TagInput
              label="Specialties"
              values={form.specialties}
              onChange={(v) => set('specialties', v)}
              placeholder="e.g. Knitwear, Cut & Sew, Embroidery — press Enter"
            />
          </section>

          {/* Trust & Credibility */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Trust & Credibility</h2>

            <TagInput
              label="Certifications"
              values={form.certifications}
              onChange={(v) => set('certifications', v)}
              placeholder="e.g. GOTS, BSCI, Sedex — press Enter"
            />

            <TagInput
              label="Notable Brand Clients"
              values={form.notable_brands}
              onChange={(v) => set('notable_brands', v)}
              placeholder="e.g. Walmart, Old Navy, Costco — press Enter"
            />
          </section>

          {/* Photos */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Photos</h2>
            <TagInput
              label="Photo URLs"
              values={form.photo_urls}
              onChange={(v) => set('photo_urls', v)}
              placeholder="Paste an image URL and press Enter"
            />
            <p className="text-xs text-muted-foreground">Upload photos to any image host (Imgur, Supabase storage, etc.) and paste the URLs here.</p>
          </section>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Add Factory'}
          </Button>

        </form>
      </div>
    </div>
  );
}
