import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEO } from '@/components/SEO';
import { BG, BORDER, INK, LAVENDER, MUTED2, PURPLE_TEXT, RED, SURFACE } from '@/components/homePage/theme';
import { Eyebrow, LandingFooter, LandingHeader } from '@/components/homePage/LandingChrome';
import { submitJobApplication, type JobApplicationFieldErrors, type JobApplicationInput } from '@/lib/jobApplication';

const inputCls = 'border-[#E4E0F0] bg-white focus-visible:ring-[#5D52D6] focus-visible:ring-offset-0';

const sections = [
  {
    title: "What you'll do",
    items: [
      'Independently identify and connect with fashion brands and designers.',
      'Develop relationships, negotiate opportunities, and help close deals.',
      'Build your sales pipeline and manage customer opportunities.',
    ],
  },
  {
    title: "What we're looking for",
    items: [
      'Strong communication and relationship-building skills.',
      'An entrepreneurial mindset and interest in startups and growth.',
      'Self-motivation and the ability to work independently.',
      'Experience in sales, fashion, or business development is an asset, but not required.',
    ],
  },
  {
    title: 'What we offer',
    items: [
      'Performance-based commissions on qualifying successful deals.',
      'Fully remote and flexible working arrangements.',
      'The opportunity to work with an early-stage Canadian fashion technology startup.',
      'Exposure to apparel manufacturing, SaaS, and B2B sales.',
    ],
  },
];

const emptyForm: JobApplicationInput = {
  fullName: '', email: '', location: '', linkedinUrl: '', resume: null, website: '',
};

const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={id} className="block mb-1.5 text-[13px] font-inter font-medium" style={{ color: INK }}>{label}</label>
    {children}
    {error && <p id={`${id}-error`} role="alert" className="mt-1 text-[13px] font-inter" style={{ color: RED }}>{error}</p>}
  </div>
);

const BusinessDevelopmentPartnerJob = () => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<JobApplicationFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof JobApplicationInput>(key: K, value: JobApplicationInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const fieldProps = (key: keyof JobApplicationInput) => ({
    id: key,
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setFormError('');
    setErrors({});
    try {
      const result = await submitJobApplication(form);
      if (result.ok) {
        setSubmitted(true);
        setForm(emptyForm);
      } else {
        setErrors(result.fields ?? {});
        setFormError(result.fields?.form ?? result.message);
      }
    } catch {
      setFormError('We could not submit your application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col" style={{ background: BG, color: INK }}>
      <SEO
        title="Independent Business Development Partner"
        description="Join Formme as a remote, commission-only Independent Business Development Partner and connect fashion brands with better apparel manufacturing."
        canonical="/careers/business-development-partner"
      />
      <LandingHeader />

      <div className="flex-1 px-4 sm:px-6 pt-32 pb-20" style={{ background: LAVENDER }}>
        <main className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1fr_460px] items-start">
          <article>
            <Eyebrow>Careers</Eyebrow>
            <h1 className="font-cormorant font-medium leading-[1.08] mb-4" style={{ color: INK, fontSize: 'clamp(34px, 4.5vw, 54px)' }}>
              Independent Business Development Partner
            </h1>
            <p className="font-inter text-[14px] font-medium mb-6" style={{ color: PURPLE_TEXT }}>
              Remote · Non-exclusive independent contractor · Commission-only
            </p>
            <div className="font-inter space-y-4 text-[15px] leading-relaxed" style={{ color: MUTED2 }}>
              <p>We're expanding Formme's growth network!</p>
              <p>
                At Formme, we're building the operating system for apparel manufacturing, connecting fashion brands and
                manufacturers through a single platform that makes production more transparent, efficient, and connected.
              </p>
              <p>
                We're looking for entrepreneurial, ambitious individuals to join us as Independent Business Development
                Partners. This opportunity is ideal for people who enjoy sales, building relationships, and working
                independently, especially those interested in fashion, technology, and startups.
              </p>
            </div>

            {sections.map((section) => (
              <section key={section.title} className="mt-8">
                <h2 className="font-inter font-semibold text-[17px] mb-3" style={{ color: INK }}>{section.title}</h2>
                <ul className="list-disc pl-5 space-y-2 font-inter text-[15px] leading-relaxed" style={{ color: MUTED2 }}>
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            ))}

            <section className="mt-8 font-inter text-[15px] leading-relaxed" style={{ color: MUTED2 }}>
              <h2 className="font-semibold text-[17px] mb-3" style={{ color: INK }}>Engagement</h2>
              <p><strong style={{ color: INK }}>Engagement type:</strong> Non-exclusive independent contractor</p>
              <p><strong style={{ color: INK }}>Compensation:</strong> Commission-only. Commission terms will be agreed upon before engagement.</p>
            </section>
          </article>

          <aside id="apply" className="rounded-2xl p-5 sm:p-7 lg:sticky lg:top-28" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
            {submitted ? (
              <div role="status" className="py-8 text-center">
                <CheckCircle2 className="mx-auto mb-4 h-10 w-10" style={{ color: PURPLE_TEXT }} aria-hidden="true" />
                <h2 className="font-cormorant text-[32px] font-medium mb-2">Application received</h2>
                <p className="font-inter text-[15px]" style={{ color: MUTED2 }}>
                  Thanks for your interest in Formme. We'll review your application and reach out by email if there's a fit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <h2 className="font-cormorant text-[32px] font-medium leading-tight">Apply now</h2>
                  <p className="font-inter text-[14px]" style={{ color: MUTED2 }}>Fields marked * are required.</p>
                </div>

                <Field id="fullName" label="Full name *" error={errors.fullName}>
                  <Input {...fieldProps('fullName')} className={inputCls} autoComplete="name" maxLength={120} value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
                </Field>
                <Field id="email" label="Email *" error={errors.email}>
                  <Input {...fieldProps('email')} className={inputCls} type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(e) => update('email', e.target.value)} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="location" label="Location" error={errors.location}>
                    <Input {...fieldProps('location')} className={inputCls} placeholder="City, country" maxLength={120} value={form.location} onChange={(e) => update('location', e.target.value)} />
                  </Field>
                  <Field id="linkedinUrl" label="LinkedIn" error={errors.linkedinUrl}>
                    <Input {...fieldProps('linkedinUrl')} className={inputCls} type="url" placeholder="https://linkedin.com/in/…" maxLength={300} value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} />
                  </Field>
                </div>
                <Field id="resume" label="Resume * (PDF or DOCX, up to 5 MB)" error={errors.resume}>
                  <Input
                    {...fieldProps('resume')}
                    className={`${inputCls} h-auto py-2 file:mr-3 file:rounded-md file:bg-[#F6F3FD] file:px-3 file:py-1 file:text-[#5D52D6]`}
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => update('resume', e.target.files?.[0] ?? null)}
                  />
                </Field>

                {/* Hidden from people; bots that fill it are ignored by the server. */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update('website', e.target.value)} />
                </div>

                <p className="font-inter text-[13px] leading-snug" style={{ color: MUTED2 }}>
                  This is a commission-only, independent contractor role. Formme will use your information and resume to review your application.
                </p>

                {formError && <p role="alert" className="text-[13px] font-inter" style={{ color: RED }}>{formError}</p>}
                <Button type="submit" className="w-full h-11 rounded-xl bg-[#5D52D6] hover:bg-[#4A3FBF] text-white" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit application'}
                </Button>
              </form>
            )}
          </aside>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
};

export default BusinessDevelopmentPartnerJob;
