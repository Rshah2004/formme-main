import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, ArrowRight, Sparkles, Clock, AlertCircle, Lock, FileText, X, Plus } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIsAdmin, useContractStatus } from '@/hooks/useContractStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DesignStageProps {
  design: any;
}

interface DesignFile {
  name: string;
  url: string;
  type: string;
}

const DesignStage = ({ design }: DesignStageProps) => {
  const { setCurrentStage, markStageComplete, updateWorkflowData } = useWorkflow();
  const { isAdmin } = useIsAdmin();
  const { isContractFinalized, loading: contractLoading } = useContractStatus(design?.id);
  
  const [designName, setDesignName] = useState(design?.name || '');
  const [description, setDescription] = useState(design?.description || '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(design?.design_file_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // New fields
  const [quantity, setQuantity] = useState<string>(design?.quantity?.toString() || '');
  const [sampleTypePreference, setSampleTypePreference] = useState<'digital' | 'physical'>('physical');
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  // Track completion status
  const isDesignUploaded = !!previewUrl;
  const isNameFilled = designName.trim().length > 0;
  const isQuantityFilled = quantity.trim().length > 0 && parseInt(quantity) > 0;
  const incompleteItems = [
    !isDesignUploaded && 'Design file upload',
    !isNameFilled && 'Design name',
    !isQuantityFilled && 'Quantity required',
  ].filter(Boolean) as string[];
  const isComplete = incompleteItems.length === 0;

  // Check for changes
  const checkForChanges = () => {
    const nameChanged = designName !== (design?.name || '');
    const descChanged = description !== (design?.description || '');
    return nameChanged || descChanged;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isContractFinalized) {
      toast.error('Cannot modify design after contract is finalized');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    const allowedTypes = [
      'image/svg+xml',
      'application/pdf',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an SVG, PDF, or PNG file');
      return;
    }

    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setHasUnsavedChanges(true);
    
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

      setHasUnsavedChanges(false);
      toast.success('Design uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload design');
    } finally {
      setIsUploading(false);
    }
  }, [design?.id, isContractFinalized]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    disabled: isContractFinalized
  });

  // Handle multiple design files upload
  const onDropFiles = useCallback(async (acceptedFiles: File[]) => {
    if (isContractFinalized) {
      toast.error('Cannot modify design after contract is finalized');
      return;
    }

    setIsUploadingFiles(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const uploadedFiles: DesignFile[] = [];
      
      for (const file of acceptedFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${design.id}/files/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('design-files')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('design-files')
          .getPublicUrl(filePath);

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: file.type
        });
      }

      setDesignFiles(prev => [...prev, ...uploadedFiles]);
      setHasUnsavedChanges(true);
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploadingFiles(false);
    }
  }, [design?.id, isContractFinalized]);

  const { getRootProps: getFilesRootProps, getInputProps: getFilesInputProps, isDragActive: isFilesDragActive } = useDropzone({
    onDrop: onDropFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
    },
    disabled: isContractFinalized
  });

  const removeDesignFile = (index: number) => {
    setDesignFiles(prev => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (isContractFinalized) {
      toast.error('Cannot save changes after contract is finalized');
      return;
    }

    try {
      // Save to designs table
      await supabase
        .from('designs')
        .update({ name: designName, description })
        .eq('id', design.id);

      // Save quantity and other data to orders table (via production_timeline_data)
      // This will be read by manufacturer in AcceptOrderStage
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id, production_timeline_data')
        .eq('design_id', design.id)
        .maybeSingle();

      if (existingOrder) {
        const existingData = (typeof existingOrder.production_timeline_data === 'object' && existingOrder.production_timeline_data !== null) 
          ? existingOrder.production_timeline_data as Record<string, any>
          : {};
        await supabase
          .from('orders')
          .update({
            quantity: parseInt(quantity) || null,
            production_timeline_data: {
              ...existingData,
              sample_type_preference: sampleTypePreference,
              design_files: designFiles
            }
          } as any)
          .eq('id', existingOrder.id);
      }

      setHasUnsavedChanges(false);
      toast.success('Changes saved');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    }
  };

  const saveAndContinue = async (markComplete: boolean) => {
    if ((checkForChanges() || hasUnsavedChanges) && !isContractFinalized) {
      await handleSave();
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

    // Check for unsaved changes
    if (checkForChanges() && !isContractFinalized) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to save them before continuing?');
      if (confirmed) {
        await saveAndContinue(true);
      } else {
        // Discard and continue
        markStageComplete('design');
        setCurrentStage('specifications');
      }
    } else {
      await saveAndContinue(true);
    }
  };

  const handleFinishLater = async () => {
    await saveAndContinue(false);
    toast.info('You can come back to complete this step later');
  };

  const handleInputChange = (field: 'name' | 'description', value: string) => {
    if (field === 'name') {
      setDesignName(value);
    } else {
      setDescription(value);
    }
    setHasUnsavedChanges(checkForChanges());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Contract Locked Alert */}
      {isContractFinalized && (
        <Alert className="border-amber-200 bg-amber-50/50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Contract Finalized</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            This design's contract has been finalized with a manufacturer. Design details are locked and cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Upload Your Design</h2>
        <p className="text-muted-foreground mt-1">
          Start by uploading your garment design. We'll help you turn it into a production-ready tech pack.
        </p>
      </div>

      {/* Incomplete Status Banner */}
      {!isComplete && !isContractFinalized && (
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
          <CardDescription>Upload your garment design as an SVG, PNG, or PDF file</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all h-[250px] flex items-center justify-center",
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              previewUrl && "border-primary/30 bg-primary/5",
              isContractFinalized ? "cursor-not-allowed opacity-60" : "cursor-pointer"
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
                  {isContractFinalized ? 'Design is locked' : 'Click or drag to replace'}
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
                <Button variant="outline" size="sm" disabled={isContractFinalized}>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Design Details</CardTitle>
              <CardDescription>Give your design a name and description</CardDescription>
            </div>
            {!isContractFinalized && hasUnsavedChanges && (
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design Name *</Label>
            <Input
              id="designName"
              value={designName}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Summer Linen Shirt"
              className="max-w-md"
              disabled={isContractFinalized}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Required *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="e.g., 500"
              className="max-w-md"
              disabled={isContractFinalized}
            />
            <p className="text-xs text-muted-foreground">
              Minimum order quantity for production
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your design vision, target audience, or any special details..."
              rows={3}
              className="resize-none"
              disabled={isContractFinalized}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sample Type Preference */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Sample Requirements</CardTitle>
          <CardDescription>Select what type of sample you need from the manufacturer</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={sampleTypePreference}
            onValueChange={(value: 'digital' | 'physical') => {
              setSampleTypePreference(value);
              setHasUnsavedChanges(true);
            }}
            disabled={isContractFinalized}
          >
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="physical" id="physical-sample" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="physical-sample" className="cursor-pointer font-medium">
                  Physical Sample
                </Label>
                <p className="text-sm text-muted-foreground">
                  Request an actual physical sample to be shipped to you before production
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="digital" id="digital-sample" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="digital-sample" className="cursor-pointer font-medium">
                  Digital Sample
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive high-quality photos/renders of the sample instead of physical delivery
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Additional Design Files */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Additional Design Files</CardTitle>
          <CardDescription>Upload reference images, patterns, artwork, or any supporting documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getFilesRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
              isFilesDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
              isContractFinalized && "cursor-not-allowed opacity-60"
            )}
          >
            <input {...getFilesInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Plus className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isFilesDragActive ? "Drop files here" : "Drag & drop or click to upload multiple files"}
              </p>
              <p className="text-xs text-muted-foreground">
                Images, PDFs, ZIPs supported
              </p>
            </div>
          </div>

          {isUploadingFiles && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading files...
            </div>
          )}

          {designFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {designFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeDesignFile(idx)}
                    disabled={isContractFinalized}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
        <div className="flex items-center gap-2">
          {isAdmin && !isContractFinalized && (
            <Button 
              variant="ghost" 
              onClick={handleFinishLater}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Clock className="w-4 h-4" />
              Finish Later
            </Button>
          )}
        </div>
        <Button onClick={handleContinue} className="gap-2" disabled={!previewUrl}>
          Continue to Specifications
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default DesignStage;
