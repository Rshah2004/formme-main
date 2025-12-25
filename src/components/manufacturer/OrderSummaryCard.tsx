import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, DollarSign, MapPin, AlertTriangle, Clock } from 'lucide-react';

interface OrderSummaryCardProps {
  order: {
    quantity?: number | null;
    budget_min?: number | null;
    budget_max?: number | null;
    price?: number | null;
    shipping_address?: string | null;
    preferred_location?: string | null;
    lead_time_days?: number | null;
    sustainability_priority?: string | null;
    designs?: {
      name?: string;
      category?: string;
    };
  };
}

export const OrderSummaryCard = ({ order }: OrderSummaryCardProps) => {
  const hasRushFlag = order.lead_time_days && order.lead_time_days < 14;
  const priceRange = order.budget_min && order.budget_max 
    ? `$${order.budget_min} - $${order.budget_max}`
    : order.price 
    ? `$${order.price}`
    : 'Not specified';

  // Extract country from address or location
  const deliveryCountry = order.preferred_location || 
    (order.shipping_address?.split(',').pop()?.trim()) || 
    'Not specified';

  return (
    <Card className="border-l-4 border-l-primary bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Order Summary
          </span>
          {hasRushFlag && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertTriangle className="w-3 h-3" />
              Rush Order
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-sm font-semibold">
                {order.quantity ? `${order.quantity} units` : 'TBD'}
              </p>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Target Price</p>
              <p className="text-sm font-semibold">{priceRange}</p>
            </div>
          </div>

          {/* Delivery Country */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Delivery</p>
              <p className="text-sm font-semibold">{deliveryCountry}</p>
            </div>
          </div>

          {/* Lead Time */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lead Time</p>
              <p className="text-sm font-semibold">
                {order.lead_time_days ? `${order.lead_time_days} days` : 'TBD'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
