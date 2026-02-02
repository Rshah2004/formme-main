import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';

interface QualityCheckStatusProps {
  order: any;
  onApprove?: () => void;
  onReject?: () => void;
  onRefresh?: () => void;
}

export const QualityCheckStatus = ({ 
  order,
  onApprove,
  onReject,
  onRefresh
}: QualityCheckStatusProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const getStatus = () => {
    if (order?.qc_approved === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent',
        borderColor: 'border-accent',
        description: 'Quality check has been approved. Ready for shipping.'
      };
    }
    if (order?.qc_approved === false) {
      return {
        status: 'rejected',
        label: 'Changes Requested',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'Quality issues have been flagged. Use the resolution chat to discuss and resolve.'
      };
    }
    if (order?.qc_submitted_at) {
      return {
        status: 'pending_approval',
        label: 'Pending Your Approval',
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        description: 'Manufacturer has submitted QC photos for your review.'
      };
    }
    return {
      status: 'not_submitted',
      label: 'Awaiting QC',
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-border',
      description: 'Waiting for manufacturer to submit quality check photos.'
    };
  };

  const handleApprove = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    try {
      await orderApi.approveQC(order.id);
      toast.success('Quality check approved!');
      onApprove?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve QC');
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

  // Get QC photos by size
  const qcPhotos = {
    S: order?.qc_photos_s,
    M: order?.qc_photos_m,
    L: order?.qc_photos_l,
    XL: order?.qc_photos_xl
  };
  const hasQcPhotos = Object.values(qcPhotos).some(Boolean);

  return (
    <>
      {needsResolution && (
        <StageResolutionBanner
          stageName="Quality Check"
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          className="mb-4"
        />
      )}

      <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quality Check</CardTitle>
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

          {/* QC Photos by Size */}
          {hasQcPhotos && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {Object.entries(qcPhotos).map(([size, url]) => (
                url && (
                  <div key={size} className="space-y-1">
                    <Badge variant="outline" className="text-xs">{size}</Badge>
                    <a 
                      href={url as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                    >
                      <img 
                        src={url as string} 
                        alt={`QC Size ${size}`} 
                        className="w-full h-full object-cover"
                      />
                    </a>
                  </div>
                )
              ))}
            </div>
          )}

          {/* QC Notes */}
          {order?.qc_notes && (
            <div className="p-3 bg-background/50 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-1">QC Notes:</p>
              <p className="text-sm">{order.qc_notes}</p>
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
                Approve QC
              </Button>
              <Button
                variant="outline"
                onClick={handleRequestChanges}
                disabled={isSubmitting}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Report Issues
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
          stage="quality_check"
          stageName="Quality Check"
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
