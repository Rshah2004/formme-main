import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type HelpStep = {
  key: string;
  title: string;
  body: string;
  selector: string;
};

const STORAGE_KEY = 'dashboard_help_tour_seen_v1';

const steps: HelpStep[] = [
  {
    key: 'dashboard',
    selector: '[data-help-target="dashboard-heading"]',
    title: 'Dashboard',
    body: 'Dashboard is where you can see the orders placed and their latest status at a glance.',
  },
  {
    key: 'orders',
    selector: '[data-help-target="sidebar-orders"]',
    title: 'Orders',
    body: 'Orders is where you can find all orders and open each one for details.',
  },
  {
    key: 'production',
    selector: '[data-help-target="sidebar-production"]',
    title: 'Production Status',
    body: 'Production Status is where you can track the pipeline and see where each order stands.',
  },
  {
    key: 'messages',
    selector: '[data-help-target="sidebar-messages"]',
    title: 'Messages',
    body: 'Messages is how you can message a manufacturer for each order.',
  },
  {
    key: 'support',
    selector: '[data-help-target="nav-support"]',
    title: 'Support',
    body: 'Support is where you can contact Formme.',
  },
];

const findFirstVisible = (startIndex = 0) => {
  for (let i = startIndex; i < steps.length; i += 1) {
    if (document.querySelector(steps[i].selector)) return i;
  }
  return -1;
};

export const DashboardHelpTour = ({ enabled }: { enabled: boolean }) => {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 96, left: 48 });
  const [arrowAtBottom, setArrowAtBottom] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const activeStep = useMemo(() => steps[stepIndex], [stepIndex]);

  useEffect(() => {
    if (!enabled) return;
    if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    const first = findFirstVisible(0);
    if (first >= 0) {
      setStepIndex(first);
      setOpen(true);
    }
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let attempts = 0;
    const find = () => {
      if (cancelled) return;
      const el = document.querySelector(activeStep.selector) as HTMLElement | null;
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        return;
      }
      attempts += 1;
      if (attempts < 12) setTimeout(find, 120);
    };
    find();
    return () => {
      cancelled = true;
    };
  }, [open, activeStep]);

  useLayoutEffect(() => {
    if (!targetRect) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const overlayRect = overlay.getBoundingClientRect();
    const desiredTop = targetRect.top - overlayRect.height - 12;
    const placeAbove = desiredTop > 12;
    const top = placeAbove
      ? desiredTop
      : Math.min(window.innerHeight - overlayRect.height - 12, targetRect.bottom + 12);
    const left = Math.min(
      window.innerWidth - overlayRect.width - 12,
      Math.max(12, targetRect.left + Math.min(24, targetRect.width / 2))
    );
    setPosition({ top, left });
    setArrowAtBottom(placeAbove);
  }, [targetRect]);

  useEffect(() => {
    if (!open || !targetRect) return;
    const update = () => {
      const el = document.querySelector(activeStep.selector) as HTMLElement | null;
      if (!el) return;
      setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, targetRect, activeStep]);

  const advance = () => {
    const nextIndex = findFirstVisible(stepIndex + 1);
    if (nextIndex === -1) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setOpen(false);
      return;
    }
    setStepIndex(nextIndex);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/35" onClick={dismiss} />
      {targetRect && (
        <div
          className="absolute rounded-xl ring-2 ring-primary/40"
          style={{
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: Math.min(window.innerWidth, targetRect.width + 12),
            height: Math.min(window.innerHeight, targetRect.height + 12),
          }}
        />
      )}
      <div
        ref={overlayRef}
        className="absolute max-w-sm w-[90vw] rounded-xl bg-white shadow-xl border border-border p-4"
        style={{ top: position.top, left: position.left }}
      >
        {targetRect && (
          <div
            className="absolute w-3 h-3 bg-white border border-border rotate-45"
            style={{
              top: arrowAtBottom ? 'auto' : -6,
              bottom: arrowAtBottom ? -6 : 'auto',
              left: 28,
            }}
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">{activeStep.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">
              {activeStep.body}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={dismiss}>Skip</Button>
          <Button size="sm" onClick={advance}>
            {stepIndex >= steps.length - 1 ? 'Got it' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};
