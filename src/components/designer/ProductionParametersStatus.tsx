import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, Calendar, Package, Layers, MessageCircle } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';

interface ProductionParametersStatusProps {
  order: any;
  onApprove?: () => void;
  onReject?: () => void;
  onRefresh?: () => void;
}

export const ProductionParametersStatus = ({ 
  order,
  onApprove,
  onReject,
  onRefresh
}: ProductionParametersStatusProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const getStatus = () => {
    if (order?.production_params_approved === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent',
        borderColor: 'border-accent',
        description: 'You have approved the production parameters. Manufacturer can proceed with sample development.'
      };
    }
    if (order?.production_params_approved === false) {
      return {
        status: 'rejected',
        label: 'Changes Requested',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'Changes have been requested. Use the resolution chat to discuss and resolve issues.'
      };
    }
    if (order?.production_params_submitted_at) {
      return {
        status: 'pending_approval',
        label: 'Pending Your Approval',
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        description: 'Manufacturer has submitted production parameters for your review.'
      };
    }
    return {
      status: 'not_submitted',
      label: 'Awaiting Submission',
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-border',
      description: 'Waiting for manufacturer to submit production parameters.'
    };
  };

  const handleApprove = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    try {
      await orderApi.approveProductionParams(order.id);
      toast.success('Production parameters approved!');
      onApprove?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve parameters');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = () => {
    setChatOpen(true);
  };

  const statusInfo = getStatus();
  const Icon = statusInfo.icon;
  const showActions = statusInfo.status === 'pending_approval';
  const needsResolution = statusInfo.status === 'rejected';

  return (
    <>
      {needsResolution && (
        <StageResolutionBanner
          stageName="Production Parameters"
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          className="mb-4"
        />
      )}

      <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Production Parameters</CardTitle>
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
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Icon className={`w-5 h-5 mt-0.5 ${statusInfo.color}`} />
            <p className="text-sm text-foreground">
              {statusInfo.description}
            </p>
          </div>

          {order?.production_params_submitted_at && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {order.lead_time_days && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lead Time</p>
                    <p className="text-sm font-medium">{order.lead_time_days} days</p>
                  </div>
                </div>
              )}
              {order.fabric_type && (
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fabric Sourcing</p>
                    <p className="text-sm font-medium">{order.fabric_type}</p>
                  </div>
                </div>
              )}
              {order.design_quantities && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quantity</p>
                    <p className="text-sm font-medium">{order.design_quantities} units</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {showActions && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleRequestChanges}
                disabled={isSubmitting}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {order?.id && (
        <ExpandedChatOverlay
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          orderId={order.id}
          stage="production_parameters"
          stageName="Production Parameters"
          isDesigner={true}
          onStageApproved={() => {
            setChatOpen(false);
            onApprove?.();
            onRefresh?.();
          }}
          onChangesRequested={() => {
            onReject?.();
            onRefresh?.();
          }}
        />
      )}
    </>
  );
};
