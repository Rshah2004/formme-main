import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Plus, Factory } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ManufacturerContactsListProps {
  onSelectManufacturer: (manufacturer: any, orderId?: string) => void;
  designId: string;
}

export const ManufacturerContactsList = ({ onSelectManufacturer, designId }: ManufacturerContactsListProps) => {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [existingChats, setExistingChats] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [designId]);

  const fetchData = async () => {
    try {
      // Fetch all active manufacturers
      const { data: allManufacturers } = await supabase
        .from('manufacturers')
        .select('id, name, location, specialties, rating')
        .eq('is_active', true);

      // Fetch existing orders with manufacturers for this design
      const { data: orders } = await supabase
        .from('orders')
        .select('id, manufacturer_id, manufacturers(id, name, location)')
        .eq('design_id', designId)
        .not('manufacturer_id', 'is', null);

      setManufacturers(allManufacturers || []);
      setExistingChats(orders || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.location?.toLowerCase().includes(search.toLowerCase())
  );

  const hasChat = (manufacturerId: string) => {
    return existingChats.some(c => c.manufacturer_id === manufacturerId);
  };

  const getOrderForManufacturer = (manufacturerId: string) => {
    return existingChats.find(c => c.manufacturer_id === manufacturerId);
  };

  if (loading) {
    return <p className="text-muted-foreground p-4">Loading contacts...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search manufacturers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Existing Chats */}
      {existingChats.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Active Conversations</h3>
          <div className="space-y-2">
            {existingChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectManufacturer(chat.manufacturers, chat.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-semibold text-primary">
                    {chat.manufacturers?.name?.charAt(0) || 'M'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{chat.manufacturers?.name}</p>
                  <p className="text-xs text-muted-foreground">{chat.manufacturers?.location}</p>
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Manufacturers */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">All Manufacturers</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredManufacturers.map((manufacturer) => {
            const order = getOrderForManufacturer(manufacturer.id);
            const chatExists = !!order;

            return (
              <button
                key={manufacturer.id}
                onClick={() => onSelectManufacturer(manufacturer, order?.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Factory className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{manufacturer.name}</p>
                  <p className="text-xs text-muted-foreground">{manufacturer.location}</p>
                </div>
                {chatExists ? (
                  <Badge variant="outline" className="text-xs">Chat</Badge>
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
