import { useState } from 'react';
import NavBar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-white text-[#344C3D]">
      <NavBar />
      <main className="container mx-auto px-4 sm:px-6 py-16 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold mb-4">Support</h1>
        <p className="text-sm sm:text-base text-[#344C3D]/70 mb-8">
          If you face any issues with production or payments, reach out here or email
          <span className="font-medium text-[#344C3D]"> formme.design@gmail.com</span>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Order ID (optional)" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          <Textarea placeholder="Describe your issue" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Support Request'}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
