import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Factory, Paperclip, X, FileText, Image as ImageIcon, Download, Check, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
}

export const FactoryMessaging = ({ designId, orderId }: FactoryMessagingProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!orderId || !currentUserId) return;

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

        const messagesWithRole = data.map(msg => ({
          ...msg,
          is_designer: msg.sender_id === orderData.designer_id
        }));

        setMessages(messagesWithRole);
      } catch (error: any) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        async (payload) => {
          const newMsg = payload.new as Message;
          
          const { data: orderData } = await supabase
            .from('orders')
            .select('designer_id')
            .eq('id', orderId)
            .single();
          
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMsg.id || (msg.id.startsWith('temp-') && msg.content === newMsg.content && msg.sender_id === newMsg.sender_id));
            if (exists) {
              return prev.map(msg => 
                (msg.id.startsWith('temp-') && msg.content === newMsg.content && msg.sender_id === newMsg.sender_id)
                  ? { ...newMsg, is_designer: newMsg.sender_id === orderData?.designer_id }
                  : msg
              );
            }
            return [...prev, {
              ...newMsg,
              is_designer: newMsg.sender_id === orderData?.designer_id
            }];
          });
          
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const uploadAttachments = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('design-files')
        .upload(`chat-attachments/${fileName}`, file);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(`chat-attachments/${fileName}`);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && pendingAttachments.length === 0) return;
    if (!orderId || !currentUserId) return;

    setSending(true);
    setUploadingAttachments(pendingAttachments.length > 0);
    
    try {
      let attachmentUrls: string[] = [];
      
      if (pendingAttachments.length > 0) {
        attachmentUrls = await uploadAttachments(pendingAttachments);
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: currentUserId,
          content: newMessage.trim() || `Sent ${attachmentUrls.length} attachment(s)`,
          attachments: attachmentUrls.length > 0 ? attachmentUrls : null
        });

      if (error) throw error;

      setNewMessage('');
      setPendingAttachments([]);
      toast.success('Message sent');
      
      const { data: orderData } = await supabase
        .from('orders')
        .select('designer_id')
        .eq('id', orderId)
        .single();

      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: newMessage.trim() || `Sent ${attachmentUrls.length} attachment(s)`,
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        is_designer: currentUserId === orderData?.designer_id,
        attachments: attachmentUrls
      };

      setMessages(prev => [...prev, tempMessage]);
      
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
      setUploadingAttachments(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingAttachments(prev => [...prev, ...files].slice(0, 10));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-3 h-3" />;
    }
    return <FileText className="w-3 h-3" />;
  };

  if (!orderId) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Factory Communication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Send your order to a manufacturer to start messaging
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-0">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full px-6">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            <div className="space-y-4 py-6">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Factory className="w-4 h-4 text-foreground/70" />
                      </div>
                    )}
                    <div className={cn("max-w-[72%] space-y-1", isMe && "items-end")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-3 shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.attachments.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 text-xs p-2 rounded-md transition-colors",
                                  isMe
                                    ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
                                    : "bg-background/60 hover:bg-background/80"
                                )}
                              >
                                {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) 
                                  ? <ImageIcon className="w-4 h-4" /> 
                                  : <FileText className="w-4 h-4" />
                                }
                                <span className="truncate flex-1">Attachment {idx + 1}</span>
                                <Download className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={cn("flex items-center gap-1 text-[11px] text-muted-foreground", isMe ? "justify-end" : "justify-start")}>
                        <span>
                          {new Date(msg.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {isMe && (
                          msg.is_read
                            ? <CheckCheck className="w-3.5 h-3.5 text-primary/70" />
                            : <Check className="w-3.5 h-3.5 text-muted-foreground/70" />
                        )}
                      </div>
                    </div>
                    {isMe && (
                      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
      </div>
      
      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="px-6 py-2 border-t">
          <div className="flex flex-wrap gap-2">
            {pendingAttachments.map((file, idx) => (
              <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                {getFileIcon(file)}
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button onClick={() => removeAttachment(idx)} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-background sticky bottom-0 z-10">
        <div className="flex gap-3 items-end">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAttachments || pendingAttachments.length >= 10}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <div className="flex-1 rounded-xl border bg-muted/30 px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              className="border-0 bg-transparent resize-none min-h-[54px] focus-visible:ring-0"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
            size="lg"
            className="shrink-0 h-[54px] w-[54px] rounded-full"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
