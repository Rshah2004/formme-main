import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  stageLabel?: string;
  action?: React.ReactNode;
  contextInfo?: { label: string; value: string }[];
}

export const StageHeader = ({ title, description, stageLabel, action, contextInfo }: StageHeaderProps) => {
  return (
    <div className="mb-8 pb-7 border-b border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {stageLabel && (
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3 font-medium">
              {stageLabel}
            </p>
          )}
          <h2
            className="font-cormorant font-semibold text-foreground leading-[1.1] mb-3"
            style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}
          >
            {title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            {description}
          </p>
          {contextInfo && contextInfo.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-4">
              {contextInfo.map((info, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs">
                  <span className="text-muted-foreground">{info.label}</span>
                  <span className="w-px h-3 bg-border" />
                  <span className="font-medium text-foreground">{info.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
};
