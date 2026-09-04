import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';
import { BG, LAVENDER, INK, MUTED2 } from '@/components/homePage/theme';
import { Eyebrow, LandingHeader, LandingFooter } from '@/components/homePage/LandingChrome';

const inputCls = 'border-[#E7E3F5] bg-white focus-visible:ring-[#5D52D6] focus-visible:ring-offset-0';

const Support = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in name, email, and message.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('support-request', {
        body: { name, email, orderId: orderId || undefined, message },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to submit');
      toast.success('Support request submitted. We will reply soon.');
      setName('');
      setEmail('');
      setOrderId('');
      setMessage('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit support request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col" style={{ background: BG, color: INK }}>
      <SEO title="Support" canonical="/support" />
      <LandingHeader />

      <div className="flex-1 px-6 pt-32 pb-20" style={{ background: LAVENDER }}>
        <main className="mx-auto max-w-2xl">
          <Eyebrow>Support</Eyebrow>
          <h1 className="font-cormorant font-medium leading-[1.08] mb-4" style={{ color: INK, fontSize: 'clamp(32px, 4vw, 48px)' }}>
            How can we help?
          </h1>
          <p className="font-inter mb-8" style={{ color: MUTED2, fontSize: '15px' }}>
            If you face any issues with production or payments, reach out here or email{' '}
            <span className="font-medium" style={{ color: INK }}>formme.design@gmail.com</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 sm:p-8" style={{ border: '1px solid #E7E3F5' }}>
            <Input className={inputCls} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input className={inputCls} placeholder="Order ID (optional)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            <Textarea className={inputCls} placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
            <Button type="submit" className="w-full h-11 rounded-xl bg-[#5D52D6] hover:bg-[#4a41c4] text-white" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Support Request'}
            </Button>
          </form>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Support;
