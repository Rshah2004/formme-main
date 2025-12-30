import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, XCircle, Calendar, Package, Layers } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';

interface ProductionParametersStatusProps {
  order: any;
  onApprove?: () => void;
  onReject?: () => void;
}

export const ProductionParametersStatus = ({ 
  order,
  onApprove,
  onReject
}: ProductionParametersStatusProps) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const getStatus = () => {
    if (order?.production_params_approved === true) {
      return {
        status: 'approved',
        label: 'Approved',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        description: 'You have approved the production parameters. Manufacturer can proceed with sample development.'
      };
    }
    if (order?.production_params_approved === false) {
      return {
        status: 'rejected',
        label: 'Rejected',
        icon: XCircle,
        color: 'text-destructive',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive/30',
        description: 'You have rejected the production parameters. Manufacturer needs to resubmit.'
      };
    }
    if (order?.production_params_submitted_at) {
      return {
        status: 'pending_approval',
        label: 'Pending Your Approval',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
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

  const handleReject = async () => {
    if (!order?.id) return;
    setIsSubmitting(true);
    try {
      await orderApi.rejectProductionParams(order.id);
      toast.info('Production parameters rejected. Manufacturer will be notified.');
      onReject?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject parameters');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusInfo = getStatus();
  const Icon = statusInfo.icon;
  const showActions = statusInfo.status === 'pending_approval';

  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Production Parameters</CardTitle>
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} border-current`}
          >
            {statusInfo.label}
          </Badge>
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
            {order.quantity && (
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-sm font-medium">{order.quantity} units</p>
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
              onClick={handleReject}
              disabled={isSubmitting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
