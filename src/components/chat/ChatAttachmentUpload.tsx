import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Paperclip, X, FileText, Image as ImageIcon, File } from 'lucide-react';

interface ChatAttachmentUploadProps {
  pendingFiles: File[];
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  acceptedTypes?: string;
}

export const ChatAttachmentUpload: React.FC<ChatAttachmentUploadProps> = ({
  pendingFiles,
  onFilesSelected,
  onRemoveFile,
  disabled = false,
  maxFiles = 10,
  acceptedTypes = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxFiles - pendingFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);
    onFilesSelected(filesToAdd);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-3 h-3" />;
    }
    if (file.type === 'application/pdf') {
      return <FileText className="w-3 h-3" />;
    }
    return <File className="w-3 h-3" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileSelect}
        accept={acceptedTypes}
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || pendingFiles.length >= maxFiles}
        className="gap-2"
      >
        <Paperclip className="w-4 h-4" />
        Attach Files
        {pendingFiles.length > 0 && (
          <Badge variant="secondary" className="ml-1">
            {pendingFiles.length}
          </Badge>
        )}
      </Button>

      {pendingFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {pendingFiles.map((file, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="gap-1 pr-1 max-w-[200px]"
            >
              {getFileIcon(file)}
              <span className="truncate">{file.name}</span>
              <span className="text-muted-foreground ml-1">
                ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="ml-1 p-0.5 hover:bg-destructive/20 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
