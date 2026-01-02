import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { FactoryMessaging } from './FactoryMessaging';
import { ManufacturerContactsList } from './ManufacturerContactsList';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface FloatingMessagesWidgetProps {
  designId: string;
}

export const FloatingMessagesWidget: React.FC<FloatingMessagesWidgetProps> = ({ designId }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showContacts, setShowContacts] = useState(true);

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
    setShowContacts(false);
  };

  const handleBack = () => {
    setShowContacts(true);
    setSelectedManufacturer(null);
    setOrderId(null);
  };

  const handleOpenChat = () => {
    setOpen(true);
    setShowContacts(true);
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
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <div className="p-2">
            {showContacts ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Manufacturer Contacts</h2>
                <ManufacturerContactsList
                  designId={designId}
                  onSelectManufacturer={handleSelectManufacturer}
                />
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={handleBack} className="p-1 hover:bg-muted rounded">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-semibold">
                    Chat with {selectedManufacturer?.name}
                  </h2>
                </div>
                {orderId ? (
                  <FactoryMessaging designId={designId} orderId={orderId} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active order with this manufacturer yet.</p>
                    <p className="text-sm mt-1">Send a request to start a conversation.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
