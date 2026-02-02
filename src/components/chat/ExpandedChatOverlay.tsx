import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Factory,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export type ChatStage = 'tech_pack_review' | 'production_parameters' | 'sample_development' | 'quality_check';

export interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_designer: boolean;
  message_type: 'text' | 'request_changes' | 'fix_applied' | 'approved' | 'attachment';
  stage?: ChatStage | null;
  parent_message_id?: string | null;
  action_metadata?: Record<string, any>;
  attachments?: string[];
}

interface ExpandedChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  stage: ChatStage;
  stageName: string;
  isDesigner: boolean;
  onStageApproved?: () => void;
  onChangesRequested?: () => void;
  // NEW: Allow pre-populating the chat with an initial issue message
  initialIssueMessage?: string;
}

export const ExpandedChatOverlay: React.FC<ExpandedChatOverlayProps> = ({
  isOpen,
  onClose,
  orderId,
  stage,
  stageName,
  isDesigner,
  onStageApproved,
  onChangesRequested,
  initialIssueMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Auto-send initial issue message when chat opens
  useEffect(() => {
    if (isOpen && initialIssueMessage && currentUserId && !hasProcessedInitialMessage && !loading) {
      setHasProcessedInitialMessage(true);
      // Send the request_changes message with the issue content
      handleSendMessage('request_changes', undefined, { reason: initialIssueMessage });
    }
  }, [isOpen, initialIssueMessage, currentUserId, hasProcessedInitialMessage, loading]);

  // Reset the processed flag when chat closes
  useEffect(() => {
    if (!isOpen) {
      setHasProcessedInitialMessage(false);
    }
  }, [isOpen]);

  // Fetch messages
  useEffect(() => {
    if (!isOpen || !orderId || !currentUserId) return;

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
          is_designer: msg.sender_id === orderData.designer_id,
          message_type: (msg as any).message_type || 'text',
          action_metadata: (msg as any).action_metadata || {}
        })) as ChatMessage[];

        setMessages(messagesWithRole);
      } catch (error: any) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`expanded-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          const { data: orderData } = await supabase
            .from('orders')
            .select('designer_id')
            .eq('id', orderId)
            .single();
          
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMsg.id);
            if (exists) return prev;
            return [...prev, {
              ...newMsg,
              is_designer: newMsg.sender_id === orderData?.designer_id,
              message_type: newMsg.message_type || 'text',
              action_metadata: newMsg.action_metadata || {}
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
  }, [isOpen, orderId, currentUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Upload attachments to storage
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

  // Send a message
  const handleSendMessage = async (
    messageType: 'text' | 'request_changes' | 'fix_applied' | 'approved' = 'text',
    parentMessageId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!orderId || !currentUserId) return;
    if (messageType === 'text' && !newMessage.trim() && pendingAttachments.length === 0) return;

    setSending(true);
    setUploadingAttachments(pendingAttachments.length > 0);
    
    try {
      let attachmentUrls: string[] = [];
      
      if (pendingAttachments.length > 0) {
        attachmentUrls = await uploadAttachments(pendingAttachments);
      }

      const messageContent = messageType === 'text' 
        ? newMessage.trim() 
        : getActionMessageContent(messageType, metadata);

      const { error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: currentUserId,
          content: messageContent,
          message_type: messageType,
          stage: messageType !== 'text' ? stage : null,
          parent_message_id: parentMessageId || null,
          action_metadata: metadata || {},
          attachments: attachmentUrls.length > 0 ? attachmentUrls : null
        });

      if (error) throw error;

      setNewMessage('');
      setPendingAttachments([]);
      
      // Handle pipeline state changes
      if (messageType === 'request_changes') {
        onChangesRequested?.();
        toast.info('Changes requested - awaiting fix');
      } else if (messageType === 'approved') {
        onStageApproved?.();
        toast.success(`${stageName} approved!`);
      } else if (messageType === 'fix_applied') {
        toast.success('Fix submitted - awaiting review');
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setSending(false);
      setUploadingAttachments(false);
    }
  };

  const getActionMessageContent = (type: string, metadata?: Record<string, any>) => {
    switch (type) {
      case 'request_changes':
        return `🔴 Changes Requested: ${metadata?.reason || 'Please review and fix the issues noted.'}`;
      case 'fix_applied':
        return `🟡 Fix Applied: ${metadata?.description || 'Changes have been made. Ready for review.'}`;
      case 'approved':
        return `🟢 Approved: ${stageName} has been approved and the next stage is now unlocked.`;
      default:
        return '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPendingAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getLatestFixMessage = () => {
    return messages
      .filter(m => m.message_type === 'fix_applied' && m.stage === stage)
      .pop();
  };

  // Check if current user can approve (they're the requester and there's a fix from the other party)
  const canApprove = () => {
    if (!isDesigner) return false;
    const latestFix = getLatestFixMessage();
    if (!latestFix) return false;
    
    // Check if this fix has already been approved
    const approvalForFix = messages.find(
      m => m.message_type === 'approved' && m.parent_message_id === latestFix.id
    );
    return !approvalForFix;
  };

  // Check if the current user is the one who needs to see the approve button
  // (i.e., if the other party has submitted a fix)
  const getStageStatus = () => {
    const changesRequested = messages.filter(m => m.message_type === 'request_changes' && m.stage === stage);
    const fixesApplied = messages.filter(m => m.message_type === 'fix_applied' && m.stage === stage);
    const approvals = messages.filter(m => m.message_type === 'approved' && m.stage === stage);

    if (approvals.length > 0) {
      return 'approved';
    }
    if (fixesApplied.length > changesRequested.length) {
      return 'fix_pending_approval';
    }
    if (changesRequested.length > 0) {
      return 'changes_requested';
    }
    return 'open';
  };

  const renderMessageBubble = (msg: ChatMessage) => {
    const isCurrentUser = msg.sender_id === currentUserId;
    const isActionMessage = msg.message_type !== 'text';
    const latestFix = getLatestFixMessage();
    const isLatestFix = msg.id === latestFix?.id;
    
    // Show approve button on fix_applied messages for the designer
    const showApproveButton = msg.message_type === 'fix_applied' && isDesigner && isLatestFix && canApprove();

    if (isActionMessage) {
      return (
        <div key={msg.id} className="flex justify-center my-4">
          <div className={cn(
            "rounded-lg px-4 py-3 max-w-[80%] text-center",
            msg.message_type === 'request_changes' && "bg-destructive/10 border border-destructive/30",
            msg.message_type === 'fix_applied' && "bg-primary/10 border border-primary/30",
            msg.message_type === 'approved' && "bg-accent border border-accent"
          )}>
            <div className="flex items-center justify-center gap-2 mb-1">
              {msg.message_type === 'request_changes' && <AlertTriangle className="w-4 h-4 text-destructive" />}
              {msg.message_type === 'fix_applied' && <Clock className="w-4 h-4 text-primary" />}
              {msg.message_type === 'approved' && <CheckCircle className="w-4 h-4 text-accent-foreground" />}
              <span className="text-xs font-medium text-muted-foreground">
                {msg.is_designer ? 'Designer' : 'Manufacturer'} • {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm">{msg.content}</p>
            
            {/* Show attachments in action messages too */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="mt-3 space-y-1">
                {msg.attachments.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs p-2 rounded bg-background/50 hover:bg-background/80"
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
            
            {/* Approve button for fix_applied messages */}
            {showApproveButton && (
              <div className="flex gap-2 justify-center mt-3">
                <Button 
                  size="sm" 
                  onClick={() => handleSendMessage('approved', msg.id)}
                  disabled={sending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve & Unlock Next Stage
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    const reason = prompt('Reason for requesting further changes:');
                    if (reason) {
                      handleSendMessage('request_changes', msg.id, { reason });
                    }
                  }}
                  disabled={sending}
                >
                  Request Further Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isCurrentUser && (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {msg.is_designer ? <User className="w-5 h-5 text-primary" /> : <Factory className="w-5 h-5 text-primary" />}
          </div>
        )}
        <div
          className={cn(
            "max-w-[70%] rounded-2xl px-4 py-3",
            isCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          
          {/* Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {msg.attachments.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 text-xs p-2 rounded",
                    isCurrentUser ? "bg-primary-foreground/20" : "bg-background/50"
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
          
          <p className={cn(
            "text-xs mt-1",
            isCurrentUser ? "opacity-70" : "text-muted-foreground"
          )}>
            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {isCurrentUser && (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>
    );
  };

  const currentStatus = getStageStatus();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="font-semibold">{stageName} - Resolution Chat</h2>
              <p className="text-xs text-muted-foreground">
                Resolve issues and coordinate fixes through chat
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              currentStatus === 'approved' && "text-accent-foreground border-accent",
              currentStatus === 'fix_pending_approval' && "text-primary border-primary/30",
              currentStatus === 'changes_requested' && "text-destructive border-destructive/30",
              currentStatus === 'open' && "text-muted-foreground"
            )}
          >
            {currentStatus === 'approved' && <><CheckCircle className="w-3 h-3 mr-1" />Approved</>}
            {currentStatus === 'fix_pending_approval' && <><Clock className="w-3 h-3 mr-1" />Fix Pending Approval</>}
            {currentStatus === 'changes_requested' && <><AlertTriangle className="w-3 h-3 mr-1" />Changes Requested</>}
            {currentStatus === 'open' && 'Open'}
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No messages yet. Start discussing the required changes.
            </p>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map(renderMessageBubble)}
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>

        {/* Action buttons for stage resolution */}
        <div className="px-4 py-2 border-t bg-muted/20">
          <div className="flex gap-2 flex-wrap">
            {/* Designer actions */}
            {isDesigner && currentStatus !== 'approved' && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => {
                  const reason = prompt('What changes are needed?');
                  if (reason) {
                    handleSendMessage('request_changes', undefined, { reason });
                  }
                }}
                disabled={sending}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Request Changes
              </Button>
            )}
            
            {/* Manufacturer actions */}
            {!isDesigner && currentStatus !== 'approved' && (
              <Button
                size="sm"
                variant="outline"
                className="text-primary border-primary/30 hover:bg-primary/10"
                onClick={() => {
                  const description = prompt('Describe the fix applied:');
                  if (description) {
                    handleSendMessage('fix_applied', undefined, { description });
                  }
                }}
                disabled={sending}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Submit Fix / Ready for Review
              </Button>
            )}
          </div>
        </div>

        {/* Pending attachments */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-2 border-t">
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((file, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  <FileText className="w-3 h-3" />
                  {file.name.slice(0, 20)}...
                  <button onClick={() => removeAttachment(idx)} className="ml-1 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-background">
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
              disabled={uploadingAttachments}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message or attach files..."
              className="resize-none min-h-[60px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage('text');
                }
              }}
            />
            <Button
              onClick={() => handleSendMessage('text')}
              disabled={(!newMessage.trim() && pendingAttachments.length === 0) || sending}
              size="lg"
              className="shrink-0 h-[60px] w-[60px] rounded-full"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
