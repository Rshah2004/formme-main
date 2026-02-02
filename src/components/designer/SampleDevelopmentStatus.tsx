import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';

interface SampleDevelopmentStatusProps {
  order: any;
  onApprove?: () => void;
  onReject?: () => void;
  onRefresh?: () => void;
}

export const SampleDevelopmentStatus = ({ 
  order,
  onApprove,
  onReject,
  onRefresh
}: SampleDevelopmentStatusProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const getStatus = () => {
    if (order?.sample_approved === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent',
        borderColor: 'border-accent',
        description: 'Sample has been approved. Production can proceed.'
      };
    }
    if (order?.sample_approved === false) {
      return {
        status: 'rejected',
        label: 'Changes Requested',
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'Changes have been requested for the sample. Use the resolution chat to discuss and resolve.'
      };
    }
    if (order?.sample_submitted_at) {
      return {
        status: 'pending_approval',
        label: 'Pending Your Approval',
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        description: 'Manufacturer has submitted sample photos for your review.'
      };
    }
    return {
      status: 'not_submitted',
      label: 'Awaiting Sample',
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-border',
      description: 'Waiting for manufacturer to submit sample photos.'
    };
  };

  const handleApprove = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    try {
      await orderApi.approveSample(order.id);
      toast.success('Sample approved!');
      onApprove?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve sample');
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

  // Get sample photos from production_timeline_data
  const samplePhotos = order?.production_timeline_data?.sample_photos || [];

  return (
    <>
      {needsResolution && (
        <StageResolutionBanner
          stageName="Sample Development"
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          className="mb-4"
        />
      )}

      <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sample Development</CardTitle>
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

          {/* Sample Photos Grid */}
          {samplePhotos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
              {samplePhotos.map((url: string, index: number) => (
                <a 
                  key={index} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                >
                  <img 
                    src={url} 
                    alt={`Sample ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
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
                Approve Sample
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
          stage="sample_development"
          stageName="Sample Development"
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
