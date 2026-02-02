import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image as ImageIcon, 
  Download, 
  ExternalLink,
  File
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatAttachmentDisplayProps {
  attachments: string[];
  isOwnMessage?: boolean;
  compact?: boolean;
}

export const ChatAttachmentDisplay: React.FC<ChatAttachmentDisplayProps> = ({
  attachments,
  isOwnMessage = false,
  compact = false
}) => {
  if (!attachments || attachments.length === 0) return null;

  const getFileInfo = (url: string) => {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
    const isPdf = extension === 'pdf';
    const isDocument = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension);
    
    return { fileName, extension, isImage, isPdf, isDocument };
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  return (
    <div className={cn(
      "space-y-2 mt-2",
      compact && "space-y-1"
    )}>
      {attachments.map((url, index) => {
        const { fileName, isImage, isPdf, isDocument } = getFileInfo(url);
        
        // Image preview
        if (isImage) {
          return (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Attachment ${index + 1}`}
                className={cn(
                  "rounded-lg object-cover cursor-pointer",
                  compact ? "max-w-[150px] max-h-[100px]" : "max-w-[250px] max-h-[200px]"
                )}
                onClick={() => window.open(url, '_blank')}
              />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-7 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(url, fileName);
                  }}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-7 h-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        }

        // File attachment (PDF, document, etc.)
        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
              isOwnMessage 
                ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" 
                : "bg-background/50 hover:bg-background/70"
            )}
            onClick={() => window.open(url, '_blank')}
          >
            {isPdf ? (
              <FileText className="w-5 h-5 text-destructive shrink-0" />
            ) : isDocument ? (
              <FileText className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <File className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium truncate",
                compact && "text-[10px]"
              )}>
                {fileName.split('-').slice(1).join('-') || fileName}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(url, fileName);
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
