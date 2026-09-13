// Temporary club access. Remove this token and redeploy to disable the link.
// This is a frontend convenience gate, not server-enforced authorization.
const CLUB_ACCESS_TOKENS: readonly string[] = [
  '6a0b3c69e93558b34cf1cef18c0bc90be33d4be69a43bd91f98865f67ad17f64',
];

export function hasCostPredictorAccess(hash: string): boolean {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('access');
  return token !== null && CLUB_ACCESS_TOKENS.includes(token);
}
