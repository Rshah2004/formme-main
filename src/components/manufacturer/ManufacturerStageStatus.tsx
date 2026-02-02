import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Lock, MessageCircle } from 'lucide-react';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';
import type { ChatStage } from '@/components/chat/ExpandedChatOverlay';

interface ManufacturerStageStatusProps {
  order: any;
  stage: ChatStage;
  stageName: string;
  onRefresh?: () => void;
}

interface StageConfigItem {
  approvedField: string;
  submittedField?: string;
  approvedLabel: string;
  rejectedLabel: string;
  pendingLabel: string;
  awaitingLabel: string;
  approvedDesc: string;
  rejectedDesc: string;
  pendingDesc: string;
  awaitingDesc: string;
}

const STAGE_CONFIG: Record<ChatStage, StageConfigItem> = {
  tech_pack_review: {
    approvedField: 'tech_pack_feasible',
    approvedLabel: 'Feasible',
    rejectedLabel: 'Changes Requested',
    pendingLabel: 'Under Review',
    awaitingLabel: 'Awaiting Review',
    approvedDesc: 'Tech pack has been confirmed as feasible. Proceed with production parameters.',
    rejectedDesc: 'Designer has requested changes. Open resolution chat to discuss and submit fixes.',
    pendingDesc: 'Waiting for designer to review the tech pack.',
    awaitingDesc: 'Tech pack review has not started.'
  },
  production_parameters: {
    approvedField: 'production_params_approved',
    submittedField: 'production_params_submitted_at',
    approvedLabel: 'Approved',
    rejectedLabel: 'Changes Requested',
    pendingLabel: 'Awaiting Approval',
    awaitingLabel: 'Not Submitted',
    approvedDesc: 'Production parameters approved. Proceed to sample development.',
    rejectedDesc: 'Designer has requested changes. Open resolution chat to discuss and submit fixes.',
    pendingDesc: 'Waiting for designer to approve production parameters.',
    awaitingDesc: 'Submit production parameters for designer approval.'
  },
  sample_development: {
    approvedField: 'sample_approved',
    submittedField: 'sample_submitted_at',
    approvedLabel: 'Approved',
    rejectedLabel: 'Changes Requested',
    pendingLabel: 'Awaiting Approval',
    awaitingLabel: 'Not Submitted',
    approvedDesc: 'Sample approved. Proceed to production.',
    rejectedDesc: 'Designer has requested changes to the sample. Open resolution chat to discuss.',
    pendingDesc: 'Waiting for designer to approve the sample.',
    awaitingDesc: 'Submit sample photos for designer approval.'
  },
  quality_check: {
    approvedField: 'qc_approved',
    submittedField: 'qc_submitted_at',
    approvedLabel: 'Approved',
    rejectedLabel: 'Issues Reported',
    pendingLabel: 'Awaiting Approval',
    awaitingLabel: 'Not Submitted',
    approvedDesc: 'Quality check passed. Ready for shipping.',
    rejectedDesc: 'Designer has reported quality issues. Open resolution chat to discuss and resolve.',
    pendingDesc: 'Waiting for designer to approve the quality check.',
    awaitingDesc: 'Submit quality check photos for designer approval.'
  }
};

// Helper to get the issue notes field for each stage
const getIssueNotesField = (stage: ChatStage): string | undefined => {
  switch (stage) {
    case 'tech_pack_review':
      return 'tech_pack_feasibility_notes';
    case 'production_parameters':
      return 'production_timeline_data'; // Check for rejection_reason inside this JSON
    case 'sample_development':
      return 'production_timeline_data'; // Check for designer_feedback inside this JSON
    case 'quality_check':
      return 'qc_notes';
    default:
      return undefined;
  }
};

const getIssueMessage = (order: any, stage: ChatStage): string | undefined => {
  switch (stage) {
    case 'tech_pack_review':
      return order?.tech_pack_feasibility_notes;
    case 'production_parameters':
      // Check production_timeline_data for rejection reason
      if (order?.production_timeline_data?.rejection_reason) {
        return order.production_timeline_data.rejection_reason;
      }
      return undefined;
    case 'sample_development':
      // Check production_timeline_data for designer feedback
      if (order?.production_timeline_data?.designer_feedback) {
        return order.production_timeline_data.designer_feedback;
      }
      return undefined;
    case 'quality_check':
      return order?.qc_notes;
    default:
      return undefined;
  }
};

export const ManufacturerStageStatus = ({ 
  order,
  stage,
  stageName,
  onRefresh
}: ManufacturerStageStatusProps) => {
  const [chatOpen, setChatOpen] = useState(false);
  const config = STAGE_CONFIG[stage];

  const getStatus = () => {
    const approvedValue = order?.[config.approvedField];
    const submittedValue = config.submittedField ? order?.[config.submittedField] : true;

    if (approvedValue === true) {
      return {
        status: 'approved',
        label: config.approvedLabel,
        icon: CheckCircle,
        color: 'text-accent-foreground',
        bgColor: 'bg-accent',
        borderColor: 'border-accent',
        description: config.approvedDesc,
        isLocked: false
      };
    }
    if (approvedValue === false) {
      return {
        status: 'rejected',
        label: config.rejectedLabel,
        icon: AlertTriangle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: config.rejectedDesc,
        isLocked: true
      };
    }
    if (submittedValue) {
      return {
        status: 'pending',
        label: config.pendingLabel,
        icon: Clock,
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30',
        description: config.pendingDesc,
        isLocked: true
      };
    }
    return {
      status: 'not_submitted',
      label: config.awaitingLabel,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      borderColor: 'border-border',
      description: config.awaitingDesc,
      isLocked: false
    };
  };

  const statusInfo = getStatus();
  const Icon = statusInfo.icon;
  const needsResolution = statusInfo.status === 'rejected';
  const issueMessage = getIssueMessage(order, stage);

  return (
    <>
      {needsResolution && (
        <StageResolutionBanner
          stageName={stageName}
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          className="mb-4"
          message={issueMessage || "Designer has requested changes. Open the resolution chat to discuss, submit your fix, and get approval to proceed."}
        />
      )}

      <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {stageName}
              {statusInfo.isLocked && (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {needsResolution && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setChatOpen(true)}
                  className="gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Submit Fix
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
              
              {/* Show the issue message from the designer */}
              {needsResolution && issueMessage && (
                <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                  <p className="text-xs font-medium text-destructive mb-1">Issue reported by designer:</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{issueMessage}</p>
                </div>
              )}
              
              {statusInfo.isLocked && !needsResolution && (
                <p className="text-xs text-muted-foreground">
                  You cannot proceed until the designer takes action.
                </p>
              )}
              
              {needsResolution && (
                <p className="text-xs text-muted-foreground">
                  Use the chat to discuss changes, attach updated files, and submit your fix for approval.
                </p>
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
          stage={stage}
          stageName={stageName}
          isDesigner={false}
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
