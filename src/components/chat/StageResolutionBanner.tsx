import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, MessageCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StageResolutionBannerProps {
  stageName: string;
  isChangesRequested: boolean;
  onOpenChat: () => void;
  className?: string;
  message?: string;
}

export const StageResolutionBanner: React.FC<StageResolutionBannerProps> = ({
  stageName,
  isChangesRequested,
  onOpenChat,
  className,
  message
}) => {
  if (!isChangesRequested) return null;

  return (
    <Card className={cn(
      "border-destructive/30 bg-destructive/5 p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground">
            {stageName} - Changes Requested
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {message || 'The other party has requested changes. Open the resolution chat to discuss and submit fixes.'}
          </p>
          <Button 
            onClick={onOpenChat}
            className="mt-3 gap-2"
            size="sm"
          >
            <MessageCircle className="w-4 h-4" />
            Open Resolution Chat
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
