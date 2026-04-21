import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/context/WorkflowContext';
import { Upload, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { buildDesignSpecsExtractionUpdate } from '@/lib/techPackExtraction';
import { StageHeader } from './StageHeader';

interface TechPackUploadStageProps {
  design: any;
}

const TechPackUploadStage = ({ design }: TechPackUploadStageProps) => {
  const { setCurrentStage, markStageComplete } = useWorkflow();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(design?.tech_pack_url || null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const hydrateTechPack = async () => {
      if (!design?.id) return;
      const { data, error } = await supabase
        .from('designs')
        .select('tech_pack_url')
        .eq('id', design.id)
        .maybeSingle();
      if (error) {
        console.error('Failed to fetch tech pack url:', error);
        return;
      }
      if (data?.tech_pack_url) {
        setUploadedUrl(data.tech_pack_url);
      }
    };

    hydrateTechPack();
  }, [design?.id]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to upload files');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${design.id}/tech-pack-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('designs')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('designs')
        .getPublicUrl(fileName);

      // Update design with tech pack URL
      await supabase
        .from('designs')
        .update({ tech_pack_url: urlData.publicUrl })
        .eq('id', design.id);

      setUploadedUrl(urlData.publicUrl);
      setIsExtracting(true);

      const { data: specs } = await supabase
        .from('design_specs')
        .select('attachments, measurements, fabric_type, gsm, print_type, construction_notes')
        .eq('design_id', design.id)
        .maybeSingle();

      try {
        const { data: extractionData, error: extractionError } = await supabase.functions.invoke('extract-techpack', {
          body: {
            techPack: {
              designId: design.id,
              designName: design?.name || 'Untitled Design',
              fileUrl: urlData.publicUrl,
              fileName: file.name,
              mimeType: file.type,
            }
          }
        });

        if (extractionError) {
          console.error('Tech pack extraction failed:', extractionError);
          toast.success('Tech pack uploaded successfully');
          toast.warning('Upload worked, but auto-extraction is unavailable until the new extract-techpack function is deployed');
        } else if (extractionData?.extraction) {
          const updates = buildDesignSpecsExtractionUpdate(
            extractionData.extraction,
            specs,
            {
              extractedText: extractionData.extractedText,
              fileUrl: urlData.publicUrl,
              fileName: file.name,
            }
          );

          await supabase
            .from('design_specs')
            .update(updates)
            .eq('design_id', design.id);

          toast.success('Tech pack uploaded and specs extracted');
        } else {
          toast.success('Tech pack uploaded successfully');
        }
      } catch (extractionInvokeError) {
        console.error('Tech pack extraction invoke failed:', extractionInvokeError);
        toast.success('Tech pack uploaded successfully');
        toast.warning('Upload worked, but auto-extraction is unavailable until the new extract-techpack function is deployed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload tech pack');
      setUploadedFile(null);
    } finally {
      setIsExtracting(false);
      setIsUploading(false);
    }
  }, [design.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });


  const handleContinueWithUpload = () => {
    markStageComplete('upload-tech-pack');
    setCurrentStage('design');
  };

  const handleGenerateTechPack = () => {
    markStageComplete('upload-tech-pack');
    setCurrentStage('design');
  };

  const removeFile = async () => {
    try {
      const { data: specs } = await supabase
        .from('design_specs')
        .select('attachments')
        .eq('design_id', design.id)
        .maybeSingle();

      const attachments =
        specs?.attachments && typeof specs.attachments === 'object' && !Array.isArray(specs.attachments)
          ? { ...(specs.attachments as Record<string, unknown>) }
          : {};

      if ('techPackExtraction' in attachments) {
        delete attachments.techPackExtraction;
      }

      await supabase
        .from('designs')
        .update({ tech_pack_url: null })
        .eq('id', design.id);

      await supabase
        .from('design_specs')
        .update({ attachments })
        .eq('design_id', design.id);

      setUploadedFile(null);
      setUploadedUrl(null);
      toast.success('Tech pack removed');
    } catch (error) {
      console.error('Failed to remove tech pack:', error);
      toast.error('Failed to remove tech pack');
    }
  };

  const hasExistingTechPack = Boolean(uploadedUrl);

  return (
    <div className="space-y-8">
      <StageHeader
        stageLabel="Step 01 · Tech Pack"
        title="Upload your tech pack."
        description="Have an existing tech pack? Drop it here — we'll parse the measurements and specs automatically so you don't have to re-enter them."
      />

      {/* Upload area */}
      {hasExistingTechPack ? (
        <div className="flex items-center justify-between p-5 rounded-xl border border-accent/30 bg-accent/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">
                {uploadedFile?.name || 'Tech pack uploaded'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · ` : ''}
                Ready for manufacturer matching
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={uploadedUrl || design?.tech_pack_url} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={removeFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/20'}
            ${(isUploading || isExtracting) ? 'opacity-60 pointer-events-none' : ''}
          `}
        >
          <input {...getInputProps()} />
          {(isUploading || isExtracting) ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-foreground">
                {isExtracting ? 'Extracting specs from your tech pack…' : 'Uploading…'}
              </p>
              {isExtracting && (
                <p className="text-xs text-muted-foreground max-w-xs">
                  We're reading your measurements, fabrics, and construction notes so the next steps are pre-filled.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm mb-1">
                  {isDragActive ? 'Drop it here' : 'Drag & drop your tech pack'}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, PNG, JPG · up to 50 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleGenerateTechPack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Don't have one? Build it step by step →
        </button>

        {hasExistingTechPack && (
          <Button onClick={handleContinueWithUpload} className="gap-2">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TechPackUploadStage;
