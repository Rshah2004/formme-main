import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';
import {
  createHandler,
  renderNotification,
  type CheckResult,
  type JobApplication,
  type Resume,
  type SubmitResult,
} from './handler.ts';

const NOTIFY_EMAIL = 'formme.design@gmail.com';
const RESUME_BUCKET = 'job-application-resumes';

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceRoleKey) throw new Error('Missing Supabase configuration');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function check(application: JobApplication, ipHash: string): Promise<CheckResult> {
  const { data, error } = await adminClient().rpc('check_job_application', {
    p_job_slug: application.jobSlug,
    p_email: application.email,
    p_ip_hash: ipHash,
  });
  if (error) throw new Error('Could not check application');
  if (data !== 'ok' && data !== 'duplicate' && data !== 'rate_limited') throw new Error('Unexpected result');
  return data;
}

async function upload(path: string, resume: Resume) {
  const { error } = await adminClient().storage.from(RESUME_BUCKET).upload(path, resume.bytes, {
    contentType: resume.contentType,
    upsert: false,
  });
  if (error) throw new Error('Could not store resume');
}

async function remove(path: string) {
  const { error } = await adminClient().storage.from(RESUME_BUCKET).remove([path]);
  if (error) throw new Error('Could not remove resume');
}

async function submit(application: JobApplication, resumePath: string, ipHash: string): Promise<SubmitResult> {
  const { data, error } = await adminClient().rpc('submit_job_application', {
    p_job_slug: application.jobSlug,
    p_full_name: application.fullName,
    p_email: application.email,
    p_location: application.location,
    p_linkedin_url: application.linkedinUrl,
    p_resume_path: resumePath,
    p_ip_hash: ipHash,
  });
  if (error) throw new Error('Could not save application');
  if (data !== 'created' && data !== 'duplicate' && data !== 'rate_limited') throw new Error('Unexpected result');
  return data;
}

function toBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function notify(application: JobApplication, resume: Resume) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: 'Formme Careers <support@formme.io>',
      to: [NOTIFY_EMAIL],
      reply_to: application.email,
      ...renderNotification(application),
      attachments: [{ filename: `resume.${resume.extension}`, content: toBase64(resume.bytes) }],
    }),
  });
  if (!res.ok) throw new Error(`Email failed with status ${res.status}`);
}

Deno.serve(createHandler({
  ipHashSecret: Deno.env.get('JOB_APPLICATION_IP_HASH_SECRET'),
  check,
  upload,
  remove,
  submit,
  notify,
}));
