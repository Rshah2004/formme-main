import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Linkedin } from 'lucide-react';
import { BG, BORDER, BORDER_DARK, INK, MUTED, MUTED2, PURPLE, PURPLE_BG } from './theme';

export const Logo = ({ dark = false }: { dark?: boolean }) => (
  <Link to="/" className="inline-flex items-center gap-2">
    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-dm-sans font-bold text-white flex-shrink-0" style={{ background: PURPLE }}>
      b
    </span>
    <span className="text-[17px] font-dm-sans font-semibold" style={{ color: dark ? '#fff' : INK }}>formme</span>
  </Link>
);

export const Eyebrow = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <span
    className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.1em] font-inter font-medium mb-4"
    style={dark ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' } : { background: PURPLE_BG, color: PURPLE }}
  >
    {children}
  </span>
);

export const SolidButton = ({ children, onClick, href }: { children: React.ReactNode; onClick?: () => void; href?: string }) => {
  const cls = 'inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5';
  const style = { background: PURPLE, color: '#fff' };
  if (href) return <Link to={href} className={cls} style={style}>{children}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
};

export const OutlineButton = ({ children, href, dark = false }: { children: React.ReactNode; href: string; dark?: boolean }) => (
  <a
    href={href}
    className="inline-flex items-center gap-1.5 rounded-[10px] px-5 py-3 text-[13px] font-inter font-medium transition-transform duration-300 hover:-translate-y-0.5"
    style={dark ? { border: `1px solid ${BORDER_DARK}`, color: '#fff' } : { border: `1px solid ${BORDER}`, color: INK, background: '#fff' }}
  >
    {children}
  </a>
);

const navLinks: { label: string; href: string; route?: boolean; chevron?: boolean }[] = [
  { label: 'Product', href: '#product', chevron: true },
  { label: 'Factories', href: '#factories' },
  { label: 'Brands', href: '#brands' },
  { label: 'Resources', href: '/support', route: true, chevron: true },
  { label: 'Company', href: '/about', route: true, chevron: true },
];

export const LandingHeader = ({ onBookDemo }: { onBookDemo: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${scrolled ? 'shadow-sm' : ''}`}
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${scrolled ? BORDER : 'transparent'}` }}
    >
      <div className="mx-auto max-w-[1400px] flex items-center justify-between px-6 md:px-10 h-16 md:h-[72px]">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) =>
            item.route ? (
              <Link key={item.label} to={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="inline-flex items-center gap-1 text-[13px] font-inter" style={{ color: MUTED2 }}>
                {item.label}{item.chevron && <ChevronDown className="w-3.5 h-3.5" />}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/auth?mode=signin" className="hidden sm:inline text-[13px] font-inter font-medium" style={{ color: INK }}>
            Sign in
          </Link>
          <SolidButton onClick={onBookDemo}>Book a demo <ArrowRight className="w-3.5 h-3.5" /></SolidButton>
        </div>
      </div>
    </header>
  );
};

const footerLinks = [
  { label: 'Product', to: '#product' },
  { label: 'Factories', to: '#factories' },
  { label: 'Brands', to: '#brands' },
  { label: 'Resources', to: '/support' },
  { label: 'Company', to: '/about' },
];

export const LandingFooter = () => (
  <footer style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
    <div className="mx-auto max-w-[1300px] px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <Logo />
      <nav className="flex flex-wrap items-center gap-x-8 gap-y-2">
        {footerLinks.map((l) =>
          l.to.startsWith('/') ? (
            <Link key={l.label} to={l.to} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</Link>
          ) : (
            <a key={l.label} href={l.to} className="text-[13px] font-inter" style={{ color: MUTED2 }}>{l.label}</a>
          )
        )}
      </nav>
      <div className="flex items-center gap-5">
        <a href="https://www.linkedin.com/company/formmedesign" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
          <Linkedin className="h-4 w-4" />
        </a>
        <span className="text-[12px] font-inter" style={{ color: MUTED }}>© {new Date().getFullYear()} Formme. All rights reserved.</span>
      </div>
    </div>
  </footer>
);
