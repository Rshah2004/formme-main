import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, Factory, Paperclip, X, FileText, Image as ImageIcon, Download, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_designer: boolean;
  attachments?: string[];
  message_type?: string;
  is_read?: boolean;
}

interface FactoryMessagingProps {
  designId: string;
  orderId?: string;
  onMessagesRead?: () => void;
}

export const FactoryMessaging = ({ designId, orderId, onMessagesRead }: FactoryMessagingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id || null));
  }, []);

  useEffect(() => {
    if (!orderId || !currentUserId) return;

    const markMessagesRead = async () => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('order_id', orderId)
        .neq('sender_id', currentUserId)
        .eq('is_read', false);
      if (!error) onMessagesRead?.();
    };

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('designer_id')
          .eq('id', orderId)
          .single();
        if (orderError) throw orderError;

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true });
        if (error) throw error;

        setMessages(data.map(msg => ({ ...msg, is_designer: msg.sender_id === orderData.designer_id })));
        await markMessagesRead();
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${orderId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `order_id=eq.${orderId}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          const { data: orderData } = await supabase.from('orders').select('designer_id').eq('id', orderId).single();
          setMessages(prev => {
            const exists = prev.some(m => m.id === newMsg.id || (m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id));
            if (exists) return prev.map(m => m.id.startsWith('temp-') && m.content === newMsg.content && m.sender_id === newMsg.sender_id
              ? { ...newMsg, is_designer: newMsg.sender_id === orderData?.designer_id } : m);
            return [...prev, { ...newMsg, is_designer: newMsg.sender_id === orderData?.designer_id }];
          });
          if (newMsg.sender_id !== currentUserId) await markMessagesRead();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const uploadAttachments = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `chat-attachments/${orderId}/${Date.now()}-${Math.random().toString(36).slice(7)}.${ext}`;
      const { error } = await supabase.storage.from('design-files').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('design-files').getPublicUrl(path);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleSend = async () => {
    if (!newMessage.trim() && pendingAttachments.length === 0) return;
    if (!orderId || !currentUserId) return;
    setSending(true);
    setUploadingAttachments(pendingAttachments.length > 0);
    try {
      const attachmentUrls = pendingAttachments.length > 0 ? await uploadAttachments(pendingAttachments) : [];
      await orderApi.sendMessage({
        order_id: orderId,
        content: newMessage.trim() || `Sent ${attachmentUrls.length} attachment(s)`,
        attachments: attachmentUrls.length > 0 ? attachmentUrls : null,
      });
      setNewMessage('');
      setPendingAttachments([]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
      setUploadingAttachments(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingAttachments(prev => [...prev, ...files].slice(0, 10));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!orderId) {
    return (
      <div className="flex items-center justify-center h-full text-center px-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">No active order yet</p>
          <p className="text-xs text-muted-foreground">Send a request to this manufacturer first to start a conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center pt-8">Loading messages…</p>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={cn('flex items-end gap-2.5', isMe ? 'justify-end' : 'justify-start')}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Factory className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className={cn('max-w-[75%] space-y-1', isMe && 'items-end flex flex-col')}>
                  <div className={cn(
                    'rounded-2xl px-3.5 py-2.5',
                    isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm'
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {msg.attachments.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer"
                            className={cn('flex items-center gap-2 text-xs p-2 rounded-lg transition-colors',
                              isMe ? 'bg-white/15 hover:bg-white/25' : 'bg-background/70 hover:bg-background')}>
                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                            <span className="truncate flex-1">Attachment {idx + 1}</span>
                            <Download className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={cn('flex items-center gap-1 text-[10px] text-muted-foreground px-1', isMe ? 'justify-end' : 'justify-start')}>
                    <span>{new Date(msg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {isMe && (msg.is_read ? <CheckCheck className="w-3 h-3 text-primary/60" /> : <Check className="w-3 h-3" />)}
                  </div>
                </div>
                {isMe && (
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex flex-wrap gap-1.5">
          {pendingAttachments.map((file, idx) => (
            <Badge key={idx} variant="secondary" className="gap-1 pr-1 text-xs">
              {file.type.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
              <span className="truncate max-w-[90px]">{file.name}</span>
              <button onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))} className="ml-1 hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-4 py-3 flex items-end gap-2">
        <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" />
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 rounded-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAttachments || pendingAttachments.length >= 10}>
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0 rounded-xl border border-border bg-muted/30 px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message…"
            className="w-full bg-transparent resize-none text-sm leading-relaxed focus:outline-none min-h-[36px] max-h-[120px]"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ height: 'auto' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <Button onClick={handleSend} disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
          size="icon" className="shrink-0 h-9 w-9 rounded-full">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
