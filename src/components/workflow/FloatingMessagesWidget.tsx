import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FactoryMessaging } from './FactoryMessaging';
import { ManufacturerContactsList } from './ManufacturerContactsList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FloatingMessagesWidgetProps {
  designId: string;
}

export const FloatingMessagesWidget: React.FC<FloatingMessagesWidgetProps> = ({ designId }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchUnreadCount();
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
  };

  const handleOpenChat = () => {
    setOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleOpenChat}
          className="flex items-center gap-3 bg-[#262626] hover:bg-[#363636] text-white px-6 py-4 rounded-full shadow-lg transition-all hover:scale-105"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-destructive text-white h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <span className="font-medium">Messages</span>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl h-[75vh] max-h-[720px] p-0 overflow-hidden">
          <div className="flex h-full min-h-0">
            {/* Left Sidebar */}
            <div className="w-[320px] border-r border-border flex flex-col h-full min-h-0">
              <DialogHeader className="p-4 border-b border-border">
                <DialogTitle>Manufacturer Contacts</DialogTitle>
              </DialogHeader>
              <ScrollArea className="flex-1 h-full">
                <div className="p-3">
                  <ManufacturerContactsList
                    designId={designId}
                    onSelectManufacturer={handleSelectManufacturer}
                  />
                </div>
              </ScrollArea>
            </div>

            {/* Right Chat Pane */}
            <div className="flex-1 flex flex-col h-full min-h-0 relative">
              <div className="p-4 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-lg font-semibold">
                  {selectedManufacturer ? `Chat with ${selectedManufacturer?.name}` : 'Select a manufacturer'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedManufacturer?.location || 'Choose a contact to start chatting'}
                </p>
              </div>
              <div className="flex-1 min-h-0 bg-transparent">
                {selectedManufacturer ? (
                  orderId ? (
                    <FactoryMessaging designId={designId} orderId={orderId} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No active order with this manufacturer yet.</p>
                      <p className="text-sm mt-1">Send a request to start a conversation.</p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a manufacturer from the left to view messages.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
