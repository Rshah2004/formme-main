import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const MESSAGES_KEY = 'messaging_help_seen_messages_v1';

export const MessagingHelpOverlay = () => {
  const [open, setOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 64, left: 64 });
  const [arrowAtBottom, setArrowAtBottom] = useState(false);
  const [searchParams] = useSearchParams();
  const designId = searchParams.get('designId');
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!designId) return;
    const seenMessages = localStorage.getItem(MESSAGES_KEY) === 'true';
    if (!seenMessages) setOpen(true);
  }, [designId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let attempts = 0;
    const find = () => {
      if (cancelled) return;
      const messagesEl = document.querySelector('[data-help-target="messages-button"]') as HTMLElement | null;
      const el = messagesEl;
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        return;
      }
      attempts += 1;
      if (attempts < 15) {
        setTimeout(find, 120);
      }
    };
    find();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const dismiss = () => {
    localStorage.setItem(MESSAGES_KEY, 'true');
    setOpen(false);
  };

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
      Math.max(12, targetRect.right - overlayRect.width)
    );
    setPosition({ top, left });
    setArrowAtBottom(placeAbove);
  }, [targetRect]);

  useEffect(() => {
    if (!open || !targetRect) return;
    const update = () => {
      const messagesEl = document.querySelector('[data-help-target="messages-button"]') as HTMLElement | null;
      const el = messagesEl;
      if (!el) return;
      setTargetRect(el.getBoundingClientRect());
    };
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, targetRect]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[20000] pointer-events-none">
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
        className="absolute max-w-sm w-[90vw] rounded-xl bg-white shadow-xl border border-border p-4 pointer-events-auto"
        style={{ top: position.top, left: position.left }}
      >
        {targetRect && (
          <div
            className="absolute w-3 h-3 bg-white border border-border rotate-45"
            style={{
              top: arrowAtBottom ? 'auto' : -6,
              bottom: arrowAtBottom ? -6 : 'auto',
              right: 24,
            }}
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">Messaging Help</h3>
          <div className="text-xs text-muted-foreground mt-2 space-y-2">
            <p>Use the Messages button to chat with manufacturers.</p>
            <p>Open a chat and click “View Design Details Submitted” to review what the factory sees.</p>
            <p>Attach files to clarify specs or resolve issues.</p>
          </div>
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
