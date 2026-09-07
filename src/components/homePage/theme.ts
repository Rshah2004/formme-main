/* Shared palette for the landing chrome (header, footer, buttons). Mirrors the
 * --c-* tokens in production-landing.css — keep the two in sync, they sit next
 * to each other on every page.
 *
 * The page is light: white ground, white cards. DARK_PANEL/PANEL_* are the
 * deep-purple feature panels that replaced the old light-lavender ones. */
export type Audience = 'brand' | 'manufacturer';

export const BG = '#FFFFFF';
export const SURFACE = '#FFFFFF';
export const LAVENDER = '#F6F3FD';
export const INK = '#17141F';
export const MUTED = '#736C80';
export const MUTED2 = '#5F586E';
export const BORDER = '#E4E0F0';
export const BORDER_DARK = 'rgba(255,255,255,0.12)';

/* Deep-purple panels */
export const DARK_PANEL = '#1D1738';
export const PANEL_INK = '#F2EFFA';
export const PANEL_MUTED = '#B0A8C8';

export const PURPLE = '#5D52D6';
/* Accent text. On the white ground this is the brand purple itself (5.8:1);
 * on a dark panel use PANEL_ACCENT instead. */
export const PURPLE_TEXT = '#5D52D6';
export const PANEL_ACCENT = '#A79BFF';
export const PURPLE_BG = 'rgba(93,82,214,0.1)';
export const GREEN = '#2F6F4E';
export const GREEN_BG = 'rgba(47,111,78,0.12)';
export const RED = '#B14A4A';
