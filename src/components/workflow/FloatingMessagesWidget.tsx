import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FactoryMessaging } from './FactoryMessaging';
import { ManufacturerContactsList } from './ManufacturerContactsList';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FloatingMessagesWidgetProps {
  designId: string;
}

export const FloatingMessagesWidget: React.FC<FloatingMessagesWidgetProps> = ({ designId }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsPayload, setDetailsPayload] = useState<any>(null);
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
  }, [designId]);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    const subscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('design_id', designId);
      if (!orders || orders.length === 0) return;

      const orderIds = orders.map(o => o.id);
      channel = supabase
        .channel(`messages-unread-${designId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          (payload) => {
            const row = (payload.new || payload.old) as any;
            if (!row?.order_id || !orderIds.includes(row.order_id)) return;
            if (row.sender_id === user.id) return;
            fetchUnreadCount();
          }
        )
        .subscribe();
    };
    subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [designId]);

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all orders for this design
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('design_id', designId);

    if (!orders || orders.length === 0) return;

    const orderIds = orders.map(o => o.id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('order_id', orderIds)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    setUnreadCount(count || 0);
  };

  const handleSelectManufacturer = (manufacturer: any, orderIdParam?: string) => {
    setSelectedManufacturer(manufacturer);
    setOrderId(orderIdParam || null);
    setShowContacts(false);
    fetchUnreadCount();
  };

  const handleOpenChat = () => {
    setOpen(true);
  };

  const handleViewDesignDetails = async () => {
    if (!orderId) return;
    setDetailsLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, design_id, quantity, sample_quantity')
        .eq('id', orderId)
        .single();
      if (orderError || !orderData) throw orderError;

      const [designRes, specsRes, techpackRes] = await Promise.all([
        supabase
          .from('designs')
          .select('name, description, design_file_url, tech_pack_url, sample_type_preference')
          .eq('id', orderData.design_id)
          .maybeSingle(),
        supabase
          .from('design_specs')
          .select('fabric_type, gsm, print_type, construction_notes')
          .eq('design_id', orderData.design_id)
          .maybeSingle(),
        supabase
          .from('techpacks')
          .select('pdf_url')
          .eq('design_id', orderData.design_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const design = designRes.data;
      const specs = specsRes.data;
      const techpackUrl = techpackRes.data?.pdf_url || design?.tech_pack_url || null;
      const designFiles: string[] = Array.isArray(design?.design_file_url)
        ? design?.design_file_url
        : design?.design_file_url
          ? [design.design_file_url]
          : [];

      const lines: string[] = [];
      lines.push('Design Details');
      lines.push(`• Name: ${design?.name || 'N/A'}`);
      if (design?.description) lines.push(`• Description: ${design.description}`);
      lines.push(`• Quantity: ${orderData.quantity ?? 'N/A'}`);
      lines.push(`• Sample Type: ${design?.sample_type_preference || 'N/A'}`);
      if (orderData.sample_quantity) lines.push(`• Sample Quantity: ${orderData.sample_quantity}`);
      if (specs?.fabric_type) lines.push(`• Fabric: ${specs.fabric_type}`);
      if (specs?.gsm) lines.push(`• GSM: ${specs.gsm}`);
      if (specs?.print_type) lines.push(`• Print Type: ${specs.print_type}`);
      if (specs?.construction_notes) lines.push(`• Construction Notes: ${specs.construction_notes}`);
      if (designFiles.length > 0) lines.push(`• Design Files: ${designFiles.join(', ')}`);
      if (techpackUrl) lines.push(`• Tech Pack: ${techpackUrl}`);

      setDetailsPayload({
        lines,
        designFiles,
        techpackUrl,
      });
      setDetailsOpen(true);
    } catch (error: any) {
      console.error('Failed to send design details:', error);
      toast.error(error?.message || 'Failed to load design details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed right-4 sm:right-6 z-50 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-6">
        <button
          onClick={handleOpenChat}
          data-help-target="messages-button"
          className="flex items-center gap-2 sm:gap-3 bg-[#262626] hover:bg-[#363636] text-white px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-destructive text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] sm:text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <span className="font-medium text-sm sm:text-base">Messages</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden rounded-2xl gap-0 w-[96vw] max-w-5xl h-[85dvh] max-h-[720px]">
          <div className="flex h-full min-h-0">
            {/* Left sidebar — contacts */}
            <div className={`flex-col w-[260px] border-r border-border min-h-0 shrink-0 ${showContacts ? 'flex' : 'hidden sm:flex'}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <DialogTitle className="text-sm font-semibold">Manufacturers</DialogTitle>
              </div>
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                <ManufacturerContactsList
                  designId={designId}
                  onSelectManufacturer={handleSelectManufacturer}
                />
              </div>
            </div>

            {/* Right — chat pane */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
              {/* Chat header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setShowContacts(v => !v)}
                    className="sm:hidden shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <span className="text-xs">☰</span>
                  </button>
                  {selectedManufacturer ? (
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">{selectedManufacturer.name?.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{selectedManufacturer.name}</p>
                        {selectedManufacturer.location && (
                          <p className="text-[11px] text-muted-foreground truncate">{selectedManufacturer.location}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a manufacturer</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {orderId && (
                    <Button variant="ghost" size="sm" onClick={handleViewDesignDetails} disabled={detailsLoading}
                      data-help-target="design-details-button" className="text-xs h-8 px-3">
                      {detailsLoading ? 'Loading…' : 'Design details'}
                    </Button>
                  )}
                  <DialogClose className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </DialogClose>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {selectedManufacturer ? (
                  <FactoryMessaging designId={designId} orderId={orderId || undefined} onMessagesRead={fetchUnreadCount} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Select a manufacturer from the left to view messages.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Design Details Submitted</DialogTitle>
          </DialogHeader>
          {detailsPayload ? (
            <div className="space-y-3 text-sm">
              <pre className="whitespace-pre-wrap rounded-md bg-muted/50 p-4 text-sm">
                {detailsPayload.lines.join('\n')}
              </pre>
              {detailsPayload.designFiles?.length > 0 && (
                <div className="space-y-1">
                  <p className="font-medium">Design Files</p>
                  <ul className="space-y-1">
                    {detailsPayload.designFiles.map((url: string) => (
                      <li key={url} className="truncate text-primary underline underline-offset-2">
                        <a href={url} target="_blank" rel="noreferrer">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailsPayload.techpackUrl && (
                <div className="space-y-1">
                  <p className="font-medium">Tech Pack</p>
                  <a
                    href={detailsPayload.techpackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {detailsPayload.techpackUrl}
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No details available.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
