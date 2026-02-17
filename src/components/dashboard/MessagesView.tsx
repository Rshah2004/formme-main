import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Building2, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  order_id: string;
}

interface Conversation {
  order_id: string;
  design_name: string;
  manufacturer_name: string | null;
  manufacturer_id: string | null;
  match_status?: 'pending' | 'accepted' | 'rejected' | string;
  last_message: string | null;
  last_message_time: string;
  unread_count: number;
}

interface ContactOption {
  order_id: string;
  design_name: string;
  manufacturer_name: string | null;
  manufacturer_id: string | null;
  match_status?: 'pending' | 'accepted' | 'rejected' | string;
}

interface MessagesViewProps {
  orders: Array<{
    id: string;
    design_id: string;
    status: string;
    created_at?: string;
    designs: { id: string; name: string } | null;
    manufacturers: { name: string } | null;
  }>;
}

const MessagesView = ({ orders }: MessagesViewProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newContactOpen, setNewContactOpen] = useState(false);
  const [contactOptions, setContactOptions] = useState<ContactOption[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, [orders]);

  useEffect(() => {
    if (selectedOrderId) {
      fetchMessages(selectedOrderId);
      
      // Set up realtime subscription
      const channel = supabase
        .channel(`messages-${selectedOrderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `order_id=eq.${selectedOrderId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMsg.id);
              if (exists) return prev;
              const tempIndex = prev.findIndex(
                msg =>
                  msg.id?.toString().startsWith('temp-') &&
                  msg.content === newMsg.content &&
                  msg.sender_id === newMsg.sender_id
              );
              if (tempIndex >= 0) {
                const next = [...prev];
                next[tempIndex] = newMsg;
                return next;
              }
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedOrderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: designsData, error: designsError } = await supabase
        .from('designs')
        .select('id, name')
        .eq('user_id', user.id);

      if (designsError) throw designsError;
      const designIds = (designsData || []).map(d => d.id);
      if (designIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: matchesData, error: matchesError } = await supabase
        .from('manufacturer_matches')
        .select('id, status, design_id, manufacturer_id, manufacturers(name)')
        .in('design_id', designIds)
        .in('status', ['pending', 'accepted']);

      if (matchesError) throw matchesError;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, design_id, manufacturer_id, created_at')
        .in('design_id', designIds)
        .not('manufacturer_id', 'is', null);

      if (ordersError) throw ordersError;

      const orderMap = new Map<string, { id: string; created_at: string | null }>();
      for (const o of ordersData || []) {
        orderMap.set(`${o.design_id}:${o.manufacturer_id}`, { id: o.id, created_at: o.created_at });
      }

      const orderIds = (ordersData || []).map(o => o.id);
      const messageMap = new Map<string, { content: string; created_at: string }>();
      if (orderIds.length > 0) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('order_id, content, created_at')
          .in('order_id', orderIds)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;
        for (const msg of messagesData || []) {
          if (!messageMap.has(msg.order_id)) {
            messageMap.set(msg.order_id, { content: msg.content, created_at: msg.created_at });
          }
        }
      }

      const designNameMap = new Map<string, string>();
      for (const d of designsData || []) {
        designNameMap.set(d.id, d.name);
      }

      const allContacts: ContactOption[] = (matchesData || [])
        .map((match: any) => {
          const orderKey = `${match.design_id}:${match.manufacturer_id}`;
          const orderMeta = orderMap.get(orderKey);
          if (!orderMeta?.id) return null;
          return {
            order_id: orderMeta.id,
            design_name: designNameMap.get(match.design_id) || 'Untitled',
            manufacturer_name: match.manufacturers?.name || null,
            manufacturer_id: match.manufacturer_id,
            match_status: match.status
          } as ContactOption;
        })
        .filter(Boolean) as ContactOption[];

      const conversationsData: Conversation[] = allContacts
        .map((contact) => {
          const lastMsg = messageMap.get(contact.order_id);
          if (!lastMsg) return null;
          return {
            ...contact,
            last_message: lastMsg.content ?? null,
            last_message_time: lastMsg.created_at ?? new Date().toISOString(),
            unread_count: 0
          } as Conversation;
        })
        .filter(Boolean) as Conversation[];

      // Sort by last message time
      conversationsData.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setConversations(conversationsData);
      setContactOptions(allContacts);

      // Auto-select the most recent conversation so reload doesn't look like "messages disappeared"
      if (!selectedOrderId && conversationsData.length > 0) {
        setSelectedOrderId(conversationsData[0].order_id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedOrderId || !currentUserId) return;

    setSending(true);
    try {
      const content = newMessage.trim();

      // Optimistic UI update so refresh/slow realtime doesn't look like messages vanish
      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          content,
          sender_id: currentUserId,
          created_at: new Date().toISOString(),
          order_id: selectedOrderId,
        },
      ]);

      await orderApi.sendMessage({
        order_id: selectedOrderId,
        content,
      });
      setNewMessage('');

      // Ensure we rehydrate from DB even if realtime isn't enabled
      await fetchMessages(selectedOrderId);
      
      // Refresh conversations to update last message
      fetchConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const selectedConversation = conversations.find(c => c.order_id === selectedOrderId);
  const activeContact = selectedConversation || selectedContact;
  const orderOptions = contactOptions;

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] sm:h-[calc(100vh-200px)] flex flex-col md:flex-row border rounded-lg overflow-hidden bg-card">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-80 border-b md:border-b-0 md:border-r flex flex-col",
        selectedOrderId && "hidden md:flex"
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Contacts</h2>
          <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">New contact</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select a manufacturer</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {contactOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No available contacts yet.</p>
                ) : (
                  contactOptions.map((conv) => (
                    <button
                      key={`contact-${conv.order_id}`}
                      onClick={() => {
                        setSelectedOrderId(conv.order_id);
                        setSelectedContact(conv);
                        setNewContactOpen(false);
                      }}
                      className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-left hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium">{conv.manufacturer_name || 'Manufacturer'}</p>
                        <p className="text-xs text-muted-foreground">{conv.design_name}</p>
                      </div>
                      {conv.match_status && (
                        <Badge variant="outline" className="text-xs">
                          {conv.match_status === 'pending' ? 'Request sent' : 'Accepted'}
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>No contacts yet</p>
              <p className="text-sm mt-1">Send a request or finalize a manufacturer to start chatting</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.order_id}
                onClick={() => setSelectedOrderId(conv.order_id)}
                className={cn(
                  "p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b",
                  selectedOrderId === conv.order_id && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10">
                      <Building2 className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">
                        {conv.manufacturer_name || 'Finding Manufacturer'}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.design_name}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.last_message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !selectedOrderId && "hidden md:flex"
      )}>
      {selectedOrderId && activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setSelectedOrderId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {activeContact.manufacturer_name || 'Manufacturer'}
                </h3>
                <div className="mt-1">
                  <Select
                    value={selectedOrderId || undefined}
                    onValueChange={(value) => {
                      const contact = orderOptions.find(o => o.order_id === value) || null;
                      setSelectedOrderId(value);
                      setSelectedContact(contact);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[220px] text-xs">
                      <SelectValue placeholder={activeContact.design_name} />
                    </SelectTrigger>
                    <SelectContent>
                      {orderOptions.map((o) => (
                        <SelectItem key={o.order_id} value={o.order_id}>
                          {o.design_name} • {o.manufacturer_name || 'Manufacturer'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwnMessage = msg.sender_id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          isOwnMessage ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={cn(
                            "text-[10px] mt-1",
                            isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
