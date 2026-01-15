import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FactoryMessaging } from '@/components/workflow/FactoryMessaging';

interface Designer {
  id: string;
  name: string;
  designName: string;
  orderId: string;
  unreadCount: number;
}

type ManufacturerOpenMessagesDetail = {
  orderId?: string;
};

export const ManufacturerMessaging = () => {
  const [open, setOpen] = useState(false);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Allow other UI (e.g. "Message Designer" button) to open this dialog
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ManufacturerOpenMessagesDetail>).detail;
      setOpen(true);
      if (detail?.orderId) setPendingOrderId(detail.orderId);
    };

    window.addEventListener('manufacturer:open-messages', handler as EventListener);
    return () => window.removeEventListener('manufacturer:open-messages', handler as EventListener);
  }, []);

  // Auto-select order once designers list is loaded
  useEffect(() => {
    if (!pendingOrderId || designers.length === 0) return;
    const designer = designers.find((d) => d.orderId === pendingOrderId);
    if (designer) setSelectedDesigner(designer);
    setPendingOrderId(null);
  }, [pendingOrderId, designers]);

  useEffect(() => {
    const fetchDesigners = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get manufacturer ID
        const { data: manufacturer } = await supabase
          .from('manufacturers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!manufacturer) return;

        // Fetch all orders for this manufacturer
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            id,
            designer_id,
            design_id,
            designs (
              id,
              name
            )
          `)
          .eq('manufacturer_id', manufacturer.id);

        if (error) throw error;

        if (orders && orders.length > 0) {
          // Fetch designer profiles and unread counts
          const designerList = await Promise.all(
            orders.map(async (order) => {
              // Fetch profile using the designer_id which is the user_id
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, company_name')
                .eq('user_id', order.designer_id)
                .maybeSingle();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
              }

              // Count unread messages for this order
              const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('order_id', order.id)
                .eq('is_read', false)
                .neq('sender_id', user.id);

              // Use full_name first, then company_name, then fallback
              const designerName = profile?.full_name?.trim() 
                ? profile.full_name 
                : profile?.company_name?.trim() 
                  ? profile.company_name 
                  : 'Unknown Designer';

              return {
                id: order.designer_id,
                name: designerName,
                designName: order.designs?.name || 'Unknown Design',
                orderId: order.id,
                unreadCount: count || 0,
              };
            })
          );

          setDesigners(designerList);
          setTotalUnread(designerList.reduce((sum, d) => sum + d.unreadCount, 0));
        }
      } catch (error) {
        console.error('Error fetching designers:', error);
      }
    };

    fetchDesigners();

    // Subscribe to new messages
    const channel = supabase
      .channel('manufacturer-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchDesigners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleOpenChat = async (designer: Designer) => {
    setSelectedDesigner(designer);

    // Mark messages as read
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('order_id', designer.orderId)
        .eq('is_read', false)
        .neq('sender_id', user.id);

      // Update unread count locally
      setDesigners(prev =>
        prev.map(d =>
          d.orderId === designer.orderId ? { ...d, unreadCount: 0 } : d
        )
      );
      setTotalUnread(prev => Math.max(0, prev - designer.unreadCount));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <>
      {/* Floating Message Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-50"
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {totalUnread > 9 ? '9+' : totalUnread}
          </Badge>
        )}
      </button>

      {/* Messages Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl h-[600px] p-0">
          <div className="flex h-full">
            {/* Left Sidebar - Designers List */}
            <div className="w-80 border-r border-border flex flex-col">
              <DialogHeader className="p-4 border-b border-border">
                <DialogTitle>Messages</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {designers.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    designers.map((designer) => (
                      <button
                        key={designer.orderId}
                        onClick={() => handleOpenChat(designer)}
                        className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${
                          selectedDesigner?.orderId === designer.orderId
                            ? 'bg-primary/5 border border-primary/20'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-sm">{designer.name}</p>
                          {designer.unreadCount > 0 && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs">
                              {designer.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {designer.designName}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedDesigner ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">{selectedDesigner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDesigner.designName}
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <FactoryMessaging
                      designId={selectedDesigner.orderId}
                      orderId={selectedDesigner.orderId}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Select a designer to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
