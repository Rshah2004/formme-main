import { supabase } from '@/integrations/supabase/client';

export const BD_PARTNER_JOB_SLUG = 'independent-business-development-partner';
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export interface JobApplicationInput {
  fullName: string;
  email: string;
  location: string;
  linkedinUrl: string;
  resume: File | null;
  website: string;
}

export type JobApplicationFieldErrors = Partial<Record<keyof JobApplicationInput | 'form', string>>;

export interface JobApplicationResult {
  ok: boolean;
  message?: string;
  fields?: JobApplicationFieldErrors;
}

const FALLBACK_ERROR = 'We could not submit your application. Please try again.';

export async function submitJobApplication(input: JobApplicationInput): Promise<JobApplicationResult> {
  if (!input.resume) return { ok: false, message: 'Please check the highlighted fields.', fields: { resume: 'Upload your resume.' } };
  if (input.resume.size > MAX_RESUME_BYTES) {
    return { ok: false, message: 'Please check the highlighted fields.', fields: { resume: 'Your resume must be 5 MB or smaller.' } };
  }

  const body = new FormData();
  body.append('jobSlug', BD_PARTNER_JOB_SLUG);
  body.append('fullName', input.fullName);
  body.append('email', input.email);
  body.append('location', input.location);
  body.append('linkedinUrl', input.linkedinUrl);
  body.append('website', input.website);
  body.append('resume', input.resume);

  const { data, error } = await supabase.functions.invoke('job-application', { body });

  if (!error) return data?.success ? { ok: true } : { ok: false, message: FALLBACK_ERROR };

  try {
    const response = (error as { context?: Response }).context;
    const details = await response?.json();
    return { ok: false, message: details?.error || FALLBACK_ERROR, fields: details?.fields };
  } catch {
    return { ok: false, message: FALLBACK_ERROR };
  }
}
