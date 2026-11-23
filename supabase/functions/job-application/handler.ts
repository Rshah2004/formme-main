export const JOB_SLUG = 'independent-business-development-partner';
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_RESUME_BYTES + 16 * 1024;
const ALLOWED_ORIGINS = new Set([
  'https://www.formme.io',
  'https://formme.io',
  'https://www.formme.co',
  'https://formme.co',
  'http://localhost:8080',
]);

export interface JobApplication {
  jobSlug: string;
  fullName: string;
  email: string;
  location: string | null;
  linkedinUrl: string | null;
}

export interface Resume {
  bytes: Uint8Array;
  extension: 'pdf' | 'docx';
  contentType: string;
}

export type CheckResult = 'ok' | 'duplicate' | 'rate_limited';
export type SubmitResult = 'created' | 'duplicate' | 'rate_limited';

export interface Dependencies {
  ipHashSecret: string | undefined;
  check: (application: JobApplication, ipHash: string) => Promise<CheckResult>;
  upload: (path: string, resume: Resume) => Promise<void>;
  remove: (path: string) => Promise<void>;
  submit: (application: JobApplication, resumePath: string, ipHash: string) => Promise<SubmitResult>;
  notify: (application: JobApplication, resume: Resume) => Promise<void>;
}

type FieldErrors = Record<string, string>;

const clean = (value: unknown) => (typeof value === 'string' ? value.normalize('NFC').trim() : '');
// eslint-disable-next-line no-control-regex -- rejecting control characters is the purpose of this check.
const hasControlChars = (value: string) => /[\u0000-\u001F\u007F]/.test(value);

function validLinkedIn(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && /^([a-z]{2,3}\.|www\.)?linkedin\.com$/i.test(url.hostname)
      && /^\/(in|pub)\/[^/]+/.test(url.pathname);
  } catch {
    return false;
  }
}

// File type comes from the content; the browser-supplied type is not trusted.
export function detectResume(bytes: Uint8Array, filename: string): Resume | null {
  const name = filename.toLowerCase();
  const startsWith = (signature: number[]) => signature.every((byte, index) => bytes[index] === byte);

  if (name.endsWith('.pdf') && startsWith([0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return { bytes, extension: 'pdf', contentType: 'application/pdf' };
  }
  if (name.endsWith('.docx') && startsWith([0x50, 0x4b, 0x03, 0x04])) {
    const content = new TextDecoder('latin1').decode(bytes);
    if (content.includes('[Content_Types].xml') && content.includes('word/document.xml')
      && !content.includes('vbaProject.bin')) {
      return {
        bytes,
        extension: 'docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    }
  }
  return null;
}

export function validateApplication(form: FormData): { application?: JobApplication; errors?: FieldErrors } {
  const fullName = clean(form.get('fullName'));
  const email = clean(form.get('email')).toLowerCase();
  const location = clean(form.get('location'));
  const linkedinUrl = clean(form.get('linkedinUrl'));
  const errors: FieldErrors = {};

  if (form.get('jobSlug') !== JOB_SLUG) errors.form = 'This job is not accepting applications.';
  if (fullName.length < 2 || fullName.length > 120 || hasControlChars(fullName)) {
    errors.fullName = 'Enter your full name.';
  }
  if (email.length > 254 || !/^[^\s@<>",;]+@[^\s@<>",;]+\.[^\s@<>",;]{2,}$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (location.length > 120 || hasControlChars(location)) {
    errors.location = 'Keep your location under 120 characters.';
  }
  if (linkedinUrl && (linkedinUrl.length > 300 || !validLinkedIn(linkedinUrl))) {
    errors.linkedinUrl = 'Enter a LinkedIn profile link, like https://www.linkedin.com/in/your-name.';
  }
  if (Object.keys(errors).length) return { errors };

  return {
    application: { jobSlug: JOB_SLUG, fullName, email, location: location || null, linkedinUrl: linkedinUrl || null },
  };
}

export const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderNotification(application: JobApplication) {
  const text = (value: string | null) => (value ? escapeHtml(value) : 'Not provided');
  return {
    subject: `New Business Development Partner application: ${application.fullName}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New job application</h2>
      <p><strong>Name:</strong> ${text(application.fullName)}</p>
      <p><strong>Email:</strong> ${text(application.email)}</p>
      <p><strong>Location:</strong> ${text(application.location)}</p>
      <p><strong>LinkedIn:</strong> ${text(application.linkedinUrl)}</p>
      <p>The resume is attached.</p>
    </div>`,
  };
}

async function hashIp(ip: string, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(ip));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Enforces the limit while streaming, because Content-Length can be missing or false.
async function readLimited(req: Request): Promise<Uint8Array | null> {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export function createHandler({ ipHashSecret, check, upload, remove, submit, notify }: Dependencies) {
  return async (req: Request): Promise<Response> => {
    const origin = req.headers.get('origin');
    const allowed = !!origin && ALLOWED_ORIGINS.has(origin);
    const headers: Record<string, string> = {
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Vary: 'Origin',
      ...(allowed ? { 'Access-Control-Allow-Origin': origin } : {}),
    };
    const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
    const tooLarge = () => reply({ error: 'Please check the highlighted fields.', fields: { resume: 'Your resume must be 5 MB or smaller.' } }, 413);

    if (!allowed) return reply({ error: 'Origin not allowed' }, 403);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (req.method !== 'POST') return reply({ error: 'Method not allowed' }, 405);

    let uploadedPath: string | null = null;
    const discardUpload = async () => {
      if (!uploadedPath) return;
      const path = uploadedPath;
      uploadedPath = null;
      try {
        await remove(path);
      } catch {
        console.error('job-application: resume cleanup failed');
      }
    };

    try {
      if (!ipHashSecret) return reply({ error: 'Applications are temporarily unavailable.' }, 503);
      const contentType = req.headers.get('content-type') ?? '';
      if (!contentType.toLowerCase().startsWith('multipart/form-data')) return reply({ error: 'Invalid application.' }, 400);

      const raw = await readLimited(req);
      if (!raw) return tooLarge();

      let form: FormData;
      try {
        form = await new Response(raw, { headers: { 'content-type': contentType } }).formData();
      } catch {
        return reply({ error: 'Invalid application.' }, 400);
      }

      // Hidden field: bots get a normal response and nothing is stored.
      if (clean(form.get('website'))) return reply({ success: true });

      const { application, errors = {} } = validateApplication(form);
      const file = form.get('resume');
      let resume: Resume | null = null;
      if (!(file instanceof File) || file.size === 0) {
        errors.resume = 'Upload your resume.';
      } else if (file.size > MAX_RESUME_BYTES) {
        return tooLarge();
      } else {
        resume = detectResume(new Uint8Array(await file.arrayBuffer()), file.name);
        if (!resume) errors.resume = 'Upload a valid PDF or DOCX file.';
      }
      if (!application || !resume) return reply({ error: 'Please check the highlighted fields.', fields: errors }, 400);

      const ip = req.headers.get('cf-connecting-ip')
        ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        ?? 'unknown';
      const ipHash = await hashIp(ip, ipHashSecret);

      const allowedToSubmit = await check(application, ipHash);
      if (allowedToSubmit === 'rate_limited') return reply({ error: 'Too many applications. Please try again later.' }, 429);
      // Same response for duplicates, so this endpoint cannot reveal who has applied.
      if (allowedToSubmit === 'duplicate') return reply({ success: true });

      // Server-generated name: the applicant's filename never reaches storage.
      const path = `${JOB_SLUG}/${crypto.randomUUID()}.${resume.extension}`;
      await upload(path, resume);
      uploadedPath = path;

      const result = await submit(application, path, ipHash);
      if (result !== 'created') {
        await discardUpload();
        if (result === 'rate_limited') return reply({ error: 'Too many applications. Please try again later.' }, 429);
        return reply({ success: true });
      }
      uploadedPath = null;

      // The application is already saved, so an email failure must not ask the applicant to retry.
      try {
        await notify(application, resume);
      } catch {
        console.error('job-application: notification failed');
      }
      return reply({ success: true });
    } catch {
      await discardUpload();
      console.error('job-application: submission failed');
      return reply({ error: 'Applications are temporarily unavailable.' }, 503);
    }
  };
}
