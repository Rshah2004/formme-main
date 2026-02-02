import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, MessageCircle } from 'lucide-react';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';

interface TechPackReviewStatusProps {
  order: any;
  onRefresh?: () => void;
}

export const TechPackReviewStatus = ({ order, onRefresh }: TechPackReviewStatusProps) => {
  const [chatOpen, setChatOpen] = useState(false);

  const getStatus = () => {
    if (order?.tech_pack_feasible === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent',
        borderColor: 'border-accent',
        description: 'Manufacturer has confirmed the tech pack is feasible for production.'
      };
    }
    if (order?.tech_pack_feasible === false) {
      return {
        status: 'changes_requested',
        label: 'Changes Requested',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'Manufacturer has requested changes. Use the resolution chat to discuss and resolve.'
      };
    }
    if (order?.status === 'sent_to_manufacturer' || order?.status === 'manufacturer_review') {
      return {
        status: 'pending',
        label: 'Under Review',
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
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
  const needsResolution = statusInfo.status === 'changes_requested';

  return (
    <>
      {needsResolution && (
        <StageResolutionBanner
          stageName="Tech Pack Review"
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          className="mb-4"
          message={order?.tech_pack_feasibility_notes || undefined}
        />
      )}

      <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tech Pack Review</CardTitle>
            <div className="flex items-center gap-2">
              {needsResolution && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatOpen(true)}
                  className="gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Resolve
                </Button>
              )}
              <Badge 
                variant="outline" 
                className={`${statusInfo.color} border-current`}
              >
                {statusInfo.label}
              </Badge>
            </div>
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

      {order?.id && (
        <ExpandedChatOverlay
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          orderId={order.id}
          stage="tech_pack_review"
          stageName="Tech Pack Review"
          isDesigner={true}
          onStageApproved={() => {
            setChatOpen(false);
            onRefresh?.();
          }}
          onChangesRequested={onRefresh}
        />
      )}
    </>
  );
};
