import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { useSearchParams } from 'react-router-dom';

type HelpStep = {
  key: string;
  title: string;
  body: string;
};

const stageHelp: Record<string, HelpStep> = {
  'upload-tech-pack': {
    key: 'stage_upload-tech-pack',
    title: 'Upload Tech Pack',
    body: 'Upload an existing tech pack or move forward to build one step by step.',
  },
  design: {
    key: 'stage_design',
    title: 'Design Details',
    body: 'Add your design name, quantity, sample type, and upload design files.',
  },
  specifications: {
    key: 'stage_specifications',
    title: 'Specifications',
    body: 'Fill in measurements and sizing details. This becomes the spec sheet.',
  },
  'fabric-color': {
    key: 'stage_fabric-color',
    title: 'Fabric & Color',
    body: 'Provide fabric composition, GSM, print details, and color variants.',
  },
  'final-tech-pack-review': {
    key: 'stage_final-tech-pack-review',
    title: 'Tech Pack Review',
    body: 'Review your full tech pack before sending to manufacturers.',
  },
  'factory-match': {
    key: 'stage_factory-match',
    title: 'Find Manufacturers',
    body: 'Select manufacturers that fit your quantity, timeline, and price range.',
  },
  waiting: {
    key: 'stage_waiting',
    title: 'Waiting for Manufacturer',
    body: 'Manufacturers are reviewing your request. You’ll be notified when they respond.',
  },
  'manufacture-selection': {
    key: 'stage_manufacture-selection',
    title: 'Finalize Manufacturer',
    body: 'Compare responses, review pricing and feasibility, then finalize the contract.',
  },
  payment: {
    key: 'stage_payment',
    title: 'Payment',
    body: 'Upload payment proof after pricing is confirmed to start sampling.',
  },
  'waiting-sample': {
    key: 'stage_waiting-sample',
    title: 'Waiting for Sample',
    body: 'The manufacturer hasn’t submitted the sample yet. You’ll be notified once it’s ready.',
  },
  sample: {
    key: 'stage_sample',
    title: 'Sample Review',
    body: 'Review the sample, approve, or request changes from the manufacturer.',
  },
  'production-tracking': {
    key: 'stage_production-tracking',
    title: 'Production Tracking',
    body: 'Track production progress and factory updates.',
  },
  quality: {
    key: 'stage_quality',
    title: 'Quality Check',
    body: 'Review QC photos and approve or reject before shipping.',
  },
  shipping: {
    key: 'stage_shipping',
    title: 'Shipping',
    body: 'Track shipment details and confirm delivery.',
  },
};

const OVERALL_KEY = 'workflow_help_seen_overall_progress_v2';
const FEASIBILITY_KEY = 'workflow_help_seen_feasibility_summary_v2';
const STAGE_HELP_NEW_USER_KEY = 'workflow_help_seen_stage_help_v1';

export const WorkflowHelpOverlay = () => {
  const { currentStage } = useWorkflow();
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('designId');
  const [active, setActive] = useState<HelpStep | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 96, left: 48 });
  const [arrowAtBottom, setArrowAtBottom] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const currentStageHelp = useMemo(() => stageHelp[currentStage], [currentStage]);

  const hasSeen = (key: string) => localStorage.getItem(key) === 'true';
  const isNewUserForStageHelp = () => localStorage.getItem(STAGE_HELP_NEW_USER_KEY) !== 'true';

  const canShowFeasibility = () => {
    const el = document.querySelector('[data-help="feasibility-summary"]');
    return !!el;
  };

  const getTargetRect = (selector?: string) => {
    if (!selector) return null;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return null;
    return el.getBoundingClientRect();
  };

  const pickNext = (preferStage: boolean) => {
    if (!designId) return;

    if (preferStage && isNewUserForStageHelp() && currentStageHelp && !hasSeen(currentStageHelp.key)) {
      setActive(currentStageHelp);
      return;
    }

    if (!hasSeen(OVERALL_KEY)) {
      setActive({
        key: OVERALL_KEY,
        title: 'Overall Progress',
        body: 'This bar shows your end‑to‑end progress across the production pipeline.',
      });
      return;
    }

    if (!hasSeen(FEASIBILITY_KEY) && canShowFeasibility()) {
      setActive({
        key: FEASIBILITY_KEY,
        title: 'Feasibility Summary',
        body: 'This summary confirms the manufacturer’s feasibility and pricing after you finalize.',
      });
      return;
    }

    setActive(null);
  };

  useEffect(() => {
    pickNext(true);
  }, [currentStage, designId]);

  const dismiss = () => {
    if (!active) return;
    localStorage.setItem(active.key, 'true');
    if (active.key.startsWith('stage_')) {
      pickNext(false);
      localStorage.setItem(STAGE_HELP_NEW_USER_KEY, 'true');
      return;
    }
    if (active.key === OVERALL_KEY) {
      pickNext(false);
      return;
    }
    setActive(null);
  };

  const targetSelector =
    active?.key === OVERALL_KEY
      ? '[data-help-target="overall-progress"]'
      : active?.key === FEASIBILITY_KEY
        ? '[data-help-target="feasibility-summary"]'
        : undefined;

  useEffect(() => {
    if (!active || !targetSelector) {
      setTargetRect(null);
      setPosition({ top: 96, left: 48 });
      setArrowAtBottom(false);
      return;
    }
    let attempts = 0;
    const update = () => {
      const rect = getTargetRect(targetSelector);
      if (rect) {
        setTargetRect(rect);
        return true;
      }
      return false;
    };
    const tick = () => {
      if (update()) return;
      attempts += 1;
      if (attempts < 8) setTimeout(tick, 150);
    };
    tick();
  }, [active, targetSelector]);

  useEffect(() => {
    if (!targetSelector) return;
    const onMove = () => {
      const rect = getTargetRect(targetSelector);
      if (rect) setTargetRect(rect);
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [targetSelector]);

  useLayoutEffect(() => {
    if (!active || !targetRect) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const overlayRect = overlay.getBoundingClientRect();
    const forceAbove = active.key === OVERALL_KEY;
    const hasSpaceAbove = targetRect.top - overlayRect.height - 16 > 12;
    const placeAbove = forceAbove || hasSpaceAbove;
    const top = placeAbove
      ? Math.max(12, targetRect.top - overlayRect.height - 16)
      : Math.min(window.innerHeight - overlayRect.height - 12, targetRect.bottom + 12);
    const left = Math.min(
      window.innerWidth - overlayRect.width - 12,
      Math.max(12, targetRect.left + Math.min(24, targetRect.width / 2))
    );
    setPosition({ top, left });
    setArrowAtBottom(placeAbove);
  }, [active, targetRect]);

  if (!active) return null;

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
            <h3 className="text-sm font-semibold">{active.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">
              {active.body}
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
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={dismiss}>Got it</Button>
        </div>
      </div>
    </div>
  );
};
