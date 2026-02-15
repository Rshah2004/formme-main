import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type BrandProfile = {
  full_name?: string | null;
  company_name?: string | null;
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
};

type BrandDetailsSectionProps = {
  profile?: BrandProfile | null;
  title?: string;
};

export const BrandDetailsSection = ({ profile, title = 'Brand Details' }: BrandDetailsSectionProps) => {
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brand details are not available.</p>
        </CardContent>
      </Card>
    );
  }

  const name = profile.company_name || profile.full_name || 'Unknown';
  const categories = (profile.categories || []).filter(Boolean);
  const location = [
    profile.shipping_city,
    profile.shipping_state,
    profile.shipping_country,
  ].filter(Boolean).join(', ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
          <p className="text-sm font-medium text-foreground">{name}</p>
        </div>

        {profile.brand_description && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Description</p>
            <p className="text-sm text-foreground">{profile.brand_description}</p>
          </div>
        )}

        {(profile.primary_category || categories.length > 0) && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Categories</p>
            <p className="text-sm text-foreground">
              {[profile.primary_category, ...categories].filter(Boolean).join(' • ')}
            </p>
          </div>
        )}

        {(profile.annual_volume_range || profile.budget_range) && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Volume / Budget</p>
            <p className="text-sm text-foreground">
              {[profile.annual_volume_range, profile.budget_range].filter(Boolean).join(' • ')}
            </p>
          </div>
        )}

        {location && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Location</p>
            <p className="text-sm text-foreground">{location}</p>
          </div>
        )}

        {profile.brand_url && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Website</p>
            <p className="text-sm text-foreground">{profile.brand_url}</p>
          </div>
        )}

        {profile.portfolio_urls && profile.portfolio_urls.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Portfolio</p>
            <p className="text-sm text-foreground">{profile.portfolio_urls.join(' • ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrandDetailsSection;
