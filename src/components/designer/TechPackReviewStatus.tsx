import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

interface TechPackReviewStatusProps {
  order: any;
}

export const TechPackReviewStatus = ({ order }: TechPackReviewStatusProps) => {
  const getStatus = () => {
    if (order?.tech_pack_feasible === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        description: 'Manufacturer has confirmed the tech pack is feasible for production.'
      };
    }
    if (order?.tech_pack_feasible === false) {
      return {
        status: 'changes_requested',
        label: 'Changes Requested',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        description: 'Manufacturer has requested changes to the tech pack.'
      };
    }
    if (order?.status === 'sent_to_manufacturer' || order?.status === 'manufacturer_review') {
      return {
        status: 'pending',
        label: 'Under Review',
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        description: 'Manufacturer is reviewing your tech pack. Production is not confirmed yet.'
      };
    }
    return {
      status: 'not_sent',
      label: 'Not Sent',
      icon: XCircle,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-border',
      description: 'Tech pack has not been sent to manufacturer yet.'
    };
  };

  const statusInfo = getStatus();
  const Icon = statusInfo.icon;

  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tech Pack Review</CardTitle>
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} border-current`}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 mt-0.5 ${statusInfo.color}`} />
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              {statusInfo.description}
            </p>
            
            {order?.tech_pack_feasibility_confirmed_at && (
              <p className="text-xs text-muted-foreground">
                Confirmed on {new Date(order.tech_pack_feasibility_confirmed_at).toLocaleDateString()}
              </p>
            )}

            {order?.tech_pack_feasibility_notes && (
              <div className="mt-3 p-3 bg-background/50 rounded-md">
                <p className="text-xs font-medium text-muted-foreground mb-1">Manufacturer Notes:</p>
                <p className="text-sm">{order.tech_pack_feasibility_notes}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
