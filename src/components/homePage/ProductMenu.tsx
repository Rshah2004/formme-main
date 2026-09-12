import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { BORDER, INK, MUTED, MUTED2, PURPLE, PURPLE_BG, PURPLE_TEXT, SURFACE } from './theme';

type ProductItem = {
  label: string;
  description: string;
  to: string;
  isNew?: boolean;
};

const forBrands: ProductItem[] = [
  { label: 'Production Workspace', description: 'Manage samples, orders and production.', to: '/brands' },
  { label: 'Cost Predictor', description: 'Request production cost estimates.', to: '/cost-predictor', isNew: true },
];

const forManufacturers: ProductItem[] = [
  { label: 'Factory Operations', description: 'Manage orders and apparel production.', to: '/manufacturers' },
  { label: 'Factory ERP', description: 'Cutting, knitting, sewing and finishing — tracked in one place.', to: '/factory-erp', isNew: true },
];

const NewBadge = () => <span className="product-menu-new inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-inter font-semibold uppercase tracking-wide" style={{ background: PURPLE_BG, color: PURPLE_TEXT }}>New</span>;

const MenuLink = ({ item, tabIndex, onNavigate }: { item: ProductItem; tabIndex: number; onNavigate: () => void }) => (
  <Link
    to={item.to}
    onClick={onNavigate}
    role="menuitem"
    tabIndex={tabIndex}
    className="product-menu-item block rounded-xl px-3 py-2.5 focus-visible:outline-none"
  >
    <span className="flex flex-wrap items-center gap-2"><span className="product-menu-label text-[13px] font-inter font-medium" style={{ color: INK }}>{item.label}</span>{item.isNew && <NewBadge />}</span>
    <span className="block text-[12px] font-inter leading-snug mt-0.5" style={{ color: MUTED2 }}>{item.description}</span>
  </Link>
);

/**
 * Compact "Product" dropdown for the main nav — grouped by audience, plus a
 * clearly-marked coming-soon capability. Always mounted (so it can transition
 * smoothly), with tabIndex toggled so closed links aren't keyboard-reachable.
 */
export const ProductMenu = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<number>();
  const closeTimer = useRef<number>();

  const clearTimers = () => {
    if (openTimer.current) window.clearTimeout(openTimer.current);
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  const scheduleOpen = () => {
    clearTimers();
    openTimer.current = window.setTimeout(() => setOpen(true), 90);
  };
  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => setOpen(false), 130);
  };

  useEffect(() => clearTimers, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const tabIndex = open ? 0 : -1;
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative" onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[13px] font-inter"
        style={{ color: MUTED2 }}
      >
        Product
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        role="menu"
        aria-label="Product"
        aria-hidden={!open}
        className="absolute left-1/2 mt-3 w-[600px] max-w-[92vw] rounded-2xl p-5 grid grid-cols-2 gap-x-6 transition-[opacity,transform] duration-200 origin-top"
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          boxShadow: '0 20px 45px -20px rgba(6,3,26,0.65)',
          opacity: open ? 1 : 0,
          transform: open ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, -6px) scale(0.98)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div>
          <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-semibold" style={{ color: MUTED }}>For brands</p>
          {forBrands.map((item) => <MenuLink key={item.label} item={item} tabIndex={tabIndex} onNavigate={close} />)}
        </div>
        <div>
          <p className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-semibold" style={{ color: MUTED }}>For manufacturers</p>
          {forManufacturers.map((item) => <MenuLink key={item.label} item={item} tabIndex={tabIndex} onNavigate={close} />)}
        </div>
        <div className="col-span-2 mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <Link
            to="/coming-soon?feature=visibility"
            role="menuitem"
            tabIndex={tabIndex}
            onClick={close}
            className="product-menu-item block rounded-xl px-3 py-2.5 focus-visible:outline-none"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="product-menu-label text-[13px] font-inter font-medium" style={{ color: INK }}>Supply Chain Visibility</span>
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide font-inter font-semibold flex-shrink-0" style={{ background: PURPLE, color: '#fff' }}>
                  Coming soon
                </span>
              </span>
              <span className="block text-[12px] font-inter leading-snug mt-0.5" style={{ color: MUTED2 }}>
                Trace materials, suppliers and production from source to shipment.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const productMenuGroups = [
  { heading: 'For brands', items: forBrands },
  { heading: 'For manufacturers', items: forManufacturers },
];

/** Mobile equivalent: an expandable accordion inside the mobile nav panel. */
export const MobileProductAccordion = ({ onNavigate }: { onNavigate: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="col-span-2">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left"
        style={{ color: MUTED2 }}
      >
        Product
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-3 flex flex-col gap-4">
          {productMenuGroups.map((group) => (
            <div key={group.heading}>
              <p className="text-[10px] uppercase tracking-[0.1em] font-inter font-semibold mb-2" style={{ color: MUTED }}>{group.heading}</p>
              <div className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <Link key={item.label} to={item.to} onClick={onNavigate} className="flex items-center gap-2 text-[13px] font-inter" style={{ color: INK }}>
                    {item.label}{item.isNew && <NewBadge />}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            to="/coming-soon?feature=visibility"
            onClick={onNavigate}
            className="inline-flex items-center gap-2 text-[13px] font-inter"
            style={{ color: INK }}
          >
            Supply Chain Visibility
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wide font-inter font-semibold" style={{ background: PURPLE, color: '#fff' }}>
              Coming soon
            </span>
          </Link>
        </div>
      )}
    </div>
  );
};
