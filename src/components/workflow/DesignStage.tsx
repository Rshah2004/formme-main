import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowRight, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DesignStageProps {
  design: any;
}

const DesignStage = ({ design }: DesignStageProps) => {
  const { setCurrentStage, markStageComplete, updateWorkflowData } = useWorkflow();
  const [designName, setDesignName] = useState(design?.name || '');
  const [description, setDescription] = useState(design?.description || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(design?.design_file_url || null);
  const [isUploading, setIsUploading] = useState(false);

  // Track completion status
  const isDesignUploaded = !!previewUrl;
  const isNameFilled = designName.trim().length > 0;
  const incompleteItems = [
    !isDesignUploaded && 'Design file upload',
    !isNameFilled && 'Design name',
  ].filter(Boolean) as string[];
  const isComplete = incompleteItems.length === 0;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.includes('svg')) {
      toast.error('Please upload an SVG file');
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${design.id}/design.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(filePath);

      await supabase
        .from('designs')
        .update({ design_file_url: publicUrl })
        .eq('id', design.id);

      toast.success('Design uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    } finally {
      setIsUploading(false);
    }
  }, [design?.id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    maxFiles: 1
  });

  const saveAndContinue = async (markComplete: boolean) => {
    if (designName !== design?.name || description !== design?.description) {
      await supabase
        .from('designs')
        .update({ name: designName, description })
        .eq('id', design.id);
    }

    if (markComplete) {
      markStageComplete('design');
    }
    setCurrentStage('specifications');
  };

  const handleContinue = async () => {
    if (!previewUrl) {
      toast.error('Please upload your design first');
      return;
    }
    await saveAndContinue(true);
  };

  const handleFinishLater = async () => {
    await saveAndContinue(false);
    toast.info('You can come back to complete this step later');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Your Design</h2>
        <p className="text-muted-foreground mt-1">
          Start by uploading your garment design. We'll help you turn it into a production-ready tech pack.
        </p>
      </div>

      {/* Incomplete Status Banner */}
      {!isComplete && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 text-sm">Incomplete</p>
            <p className="text-sm text-amber-700">
              Missing: {incompleteItems.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Design Upload Area */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Design File</CardTitle>
          <CardDescription>Upload your garment design as an SVG file</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer h-[250px] flex items-center justify-center",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              previewUrl && "border-primary/30 bg-primary/5"
            )}
          >
            <input {...getInputProps()} />
            
            {previewUrl ? (
              <div className="space-y-3">
                <div className="w-full max-w-[200px] mx-auto aspect-square bg-background rounded-lg overflow-hidden border border-border">
                  <img 
                    src={previewUrl} 
                    alt="Design preview" 
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click or drag to replace
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {isDragActive ? "Drop your design here" : "Drag & drop your design"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    SVG files only • Vector format preserves quality
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {isUploading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Details */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Design Details</CardTitle>
          <CardDescription>Give your design a name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design Name *</Label>
            <Input
              id="designName"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="e.g., Summer Linen Shirt"
              className="max-w-md"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your design vision, target audience, or any special details..."
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tip Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">Pro Tip</p>
            <p className="text-sm text-muted-foreground">
              Upload a clean SVG file with clearly defined layers for best results. Our AI will analyze your design to help generate accurate specifications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button 
          variant="ghost" 
          onClick={handleFinishLater}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Clock className="w-4 h-4" />
          Finish Later
        </Button>
        <Button onClick={handleContinue} className="gap-2" disabled={!previewUrl}>
          Continue to Specifications
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DesignStage;
