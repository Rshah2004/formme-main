import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Plus, X, Palette, Shirt, Clock, Lock, Upload, AlertCircle, ImageIcon, Trash2 } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsAdmin, useContractStatus } from '@/hooks/useContractStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FabricColorStageProps {
  design: any;
}

interface FabricEntry {
  id: string;
  type: string;
  fiberPercent: string;
}

interface SizeColorEntry {
  id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  quantity: string;
}

const fabricTypes = [
  'Cotton',
  'Organic Cotton',
  'Linen',
  'Silk',
  'Wool',
  'Polyester',
  'Nylon',
  'Rayon',
  'Bamboo',
  'Hemp',
  'Modal',
  'Tencel',
  'Blend',
  'Other'
];

const printTypes = [
  'None',
  'Screen Print',
  'DTG (Direct to Garment)',
  'Sublimation',
  'Embroidery',
  'Heat Transfer',
  'Block Print',
  'Tie Dye',
  'Other'
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

const FabricColorStage = ({ design }: FabricColorStageProps) => {
  const { setCurrentStage, markStageComplete, workflowData, updateWorkflowData } = useWorkflow();
  const { isAdmin } = useIsAdmin();
  const { isContractFinalized } = useContractStatus(design?.id);

  const [fabrics, setFabrics] = useState<FabricEntry[]>([
    { id: '1', type: '', fiberPercent: '100' }
  ]);
  const [gsm, setGsm] = useState(workflowData.gsm || '');
  const [printType, setPrintType] = useState(workflowData.print || 'None');
  const [colorNotes, setColorNotes] = useState('');
  const [constructionNotes, setConstructionNotes] = useState(workflowData.constructionNotes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  
  // Pattern upload state
  const [patternUrl, setPatternUrl] = useState<string | null>(null);
  const [isUploadingPattern, setIsUploadingPattern] = useState(false);
  
  // Size/Color variants
  const [sizeColorEntries, setSizeColorEntries] = useState<SizeColorEntry[]>([
    { id: '1', size: 'M', color: '', quantity: '' }
  ]);

  // Calculate total fiber percentage
  const totalFiberPercent = fabrics.reduce((sum, f) => sum + (parseFloat(f.fiberPercent) || 0), 0);
  const isFiberPercentValid = Math.abs(totalFiberPercent - 100) < 0.01;

  // Load existing specs
  useEffect(() => {
    const loadSpecs = async () => {
      const { data: specs } = await supabase
        .from('design_specs')
        .select('fabric_type, gsm, print_type, construction_notes, artwork_url')
        .eq('design_id', design.id)
        .maybeSingle();

      if (specs) {
        if (specs.fabric_type) {
          // Try to parse fabric_type as JSON for multiple fabrics
          try {
            const parsed = JSON.parse(specs.fabric_type);
            if (Array.isArray(parsed)) {
              setFabrics(parsed.map((f: any, i: number) => ({
                id: String(i + 1),
                type: f.type || '',
                fiberPercent: f.fiberPercent || '100'
              })));
            } else {
              setFabrics([{ id: '1', type: specs.fabric_type, fiberPercent: '100' }]);
            }
          } catch {
            setFabrics([{ id: '1', type: specs.fabric_type, fiberPercent: '100' }]);
          }
        }
        if (specs.gsm) setGsm(specs.gsm.toString());
        if (specs.print_type) setPrintType(specs.print_type);
        if (specs.construction_notes) setConstructionNotes(specs.construction_notes);
        if (specs.artwork_url) setPatternUrl(specs.artwork_url);
        setOriginalData(specs);
      }
    };
    loadSpecs();
  }, [design.id]);

  const addFabric = () => {
    if (isContractFinalized) return;
    setFabrics(prev => [...prev, { 
      id: Date.now().toString(), 
      type: '', 
      fiberPercent: '' 
    }]);
    setHasUnsavedChanges(true);
  };

  const removeFabric = (id: string) => {
    if (isContractFinalized) return;
    if (fabrics.length > 1) {
      setFabrics(prev => prev.filter(f => f.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const updateFabric = (id: string, field: keyof FabricEntry, value: string) => {
    if (isContractFinalized) return;
    setFabrics(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    setHasUnsavedChanges(true);
  };

  // Size/Color handlers
  const addSizeColorEntry = () => {
    if (isContractFinalized) return;
    setSizeColorEntries(prev => [...prev, {
      id: Date.now().toString(),
      size: 'M',
      color: '',
      quantity: ''
    }]);
    setHasUnsavedChanges(true);
  };

  const removeSizeColorEntry = (id: string) => {
    if (isContractFinalized) return;
    if (sizeColorEntries.length > 1) {
      setSizeColorEntries(prev => prev.filter(e => e.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const updateSizeColorEntry = (id: string, field: keyof SizeColorEntry, value: string) => {
    if (isContractFinalized) return;
    setSizeColorEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    setHasUnsavedChanges(true);
  };

  // Pattern upload handler
  const onPatternDrop = useCallback(async (acceptedFiles: File[]) => {
    if (isContractFinalized) return;
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setIsUploadingPattern(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${design.id}/pattern.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(filePath);

      setPatternUrl(publicUrl);
      setHasUnsavedChanges(true);
      toast.success('Pattern uploaded successfully');
    } catch (error) {
      console.error('Pattern upload error:', error);
      toast.error('Failed to upload pattern');
    } finally {
      setIsUploadingPattern(false);
    }
  }, [design?.id, isContractFinalized]);

  const { getRootProps: getPatternRootProps, getInputProps: getPatternInputProps, isDragActive: isPatternDragActive } = useDropzone({
    onDrop: onPatternDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    disabled: isContractFinalized
  });

  const removePattern = async () => {
    if (isContractFinalized) return;
    setPatternUrl(null);
    setHasUnsavedChanges(true);
    toast.success('Pattern removed');
  };

  const handleBack = () => {
    setCurrentStage('specifications');
  };

  const handleSave = async () => {
    if (isContractFinalized) {
      toast.error('Cannot save changes after contract is finalized');
      return;
    }

    // Validate fiber percentage
    if (!isFiberPercentValid) {
      toast.error(`Fiber percentages must add up to 100%. Currently: ${totalFiberPercent}%`);
      return;
    }

    try {
      const fabricData = fabrics.map(f => ({ type: f.type, fiberPercent: f.fiberPercent }));
      
      const { data: existing } = await supabase
        .from('design_specs')
        .select('id')
        .eq('design_id', design.id)
        .maybeSingle();

      const specsData = {
        fabric_type: JSON.stringify(fabricData),
        gsm: gsm ? parseInt(gsm) : null,
        print_type: printType !== 'None' ? printType : null,
        construction_notes: constructionNotes || null,
        artwork_url: patternUrl || null,
      };

      if (existing) {
        await supabase
          .from('design_specs')
          .update(specsData)
          .eq('design_id', design.id);
      } else {
        await supabase
          .from('design_specs')
          .insert({ design_id: design.id, ...specsData });
      }

      setHasUnsavedChanges(false);
      toast.success('Changes saved');
    } catch (error) {
      console.error('Error saving fabric specs:', error);
      toast.error('Failed to save fabric specifications');
    }
  };

  const handleContinue = async () => {
    // Validate fiber percentage
    if (!isFiberPercentValid) {
      toast.error(`Fiber percentages must add up to 100%. Currently: ${totalFiberPercent}%`);
      return;
    }

    // Check for unsaved changes
    if (hasUnsavedChanges && !isContractFinalized) {
      const confirmed = window.confirm('You have unsaved changes. Do you want to save them before continuing?');
      if (confirmed) {
        await handleSave();
      }
    }

    if (!isContractFinalized) {
      const primaryFabric = fabrics[0];
      updateWorkflowData({ 
        fabric: primaryFabric?.type || '',
        gsm: gsm,
        print: printType,
        constructionNotes 
      });
      markStageComplete('fabric-color');
    }
    setCurrentStage('final-tech-pack-review');
  };

  const handleFinishLater = async () => {
    if (hasUnsavedChanges && !isContractFinalized) {
      await handleSave();
    }
    setCurrentStage('final-tech-pack-review');
    toast.info('You can come back to complete this step later');
  };

  return (
    <div className="space-y-6">
      {/* Contract Locked Alert */}
      {isContractFinalized && (
        <Alert className="border-amber-200 bg-amber-50/50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Contract Finalized</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm">
            This design's contract has been finalized. Fabric specifications are locked and cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Fabric & Color</h2>
          <p className="text-muted-foreground mt-1">
            Specify the materials and finishes for your garment
          </p>
        </div>
        {!isContractFinalized && hasUnsavedChanges && (
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        )}
      </div>

      {/* Fiber Percentage Warning */}
      {!isFiberPercentValid && fabrics.length > 0 && fabrics[0].type && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Fiber Composition</AlertTitle>
          <AlertDescription>
            Fiber percentages must add up to 100%. Current total: {totalFiberPercent}%
          </AlertDescription>
        </Alert>
      )}

      {/* Fabric Selection Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shirt className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Fabric Composition</CardTitle>
            </div>
            {!isContractFinalized && (
              <Button variant="outline" size="sm" onClick={addFabric} className="gap-1">
                <Plus className="w-4 h-4" />
                Add Fabric
              </Button>
            )}
          </div>
          <CardDescription>Define the fabrics used in your garment (must total 100%)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fabrics.map((fabric, index) => (
            <div key={fabric.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg">
              <div className="col-span-7 space-y-2">
                <Label>Fabric Type</Label>
                <Select 
                  value={fabric.type} 
                  onValueChange={(value) => updateFabric(fabric.id, 'type', value)}
                  disabled={isContractFinalized}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {fabricTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4 space-y-2">
                <Label>Fiber %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={fabric.fiberPercent}
                    onChange={(e) => updateFabric(fabric.id, 'fiberPercent', e.target.value)}
                    placeholder="100"
                    max={100}
                    min={0}
                    disabled={isContractFinalized}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="col-span-1">
                {fabrics.length > 1 && !isContractFinalized && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeFabric(fabric.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Total percentage display */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <Badge variant={isFiberPercentValid ? "default" : "destructive"}>
              {totalFiberPercent}%
            </Badge>
          </div>

          {/* GSM Field - Separate and applies to all fabrics */}
          <div className="pt-4 border-t">
            <div className="max-w-xs space-y-2">
              <Label>GSM (Grams per Square Meter)</Label>
              <Input
                type="number"
                value={gsm}
                onChange={(e) => { 
                  if (!isContractFinalized) { 
                    setGsm(e.target.value); 
                    setHasUnsavedChanges(true); 
                  }
                }}
                placeholder="180"
                disabled={isContractFinalized}
              />
              <p className="text-xs text-muted-foreground">This GSM applies to the entire fabric composition</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Upload Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Pattern Upload</CardTitle>
          </div>
          <CardDescription>Upload a pattern image (PNG, JPG) for your garment</CardDescription>
        </CardHeader>
        <CardContent>
          {patternUrl ? (
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-lg border overflow-hidden bg-muted">
                <img 
                  src={patternUrl} 
                  alt="Pattern" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Pattern uploaded</p>
                <p className="text-xs text-muted-foreground mb-3">Click remove to upload a different pattern</p>
                {!isContractFinalized && (
                  <Button variant="outline" size="sm" onClick={removePattern} className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    Remove Pattern
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div
              {...getPatternRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
                isPatternDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                isContractFinalized && "cursor-not-allowed opacity-60"
              )}
            >
              <input {...getPatternInputProps()} />
              <div className="space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium">
                  {isPatternDragActive ? "Drop pattern here" : "Drag & drop pattern image"}
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>
          )}
          {isUploadingPattern && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Size & Color Variants Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Size & Color Variants</CardTitle>
            </div>
            {!isContractFinalized && (
              <Button variant="outline" size="sm" onClick={addSizeColorEntry} className="gap-1">
                <Plus className="w-4 h-4" />
                Add Variant
              </Button>
            )}
          </div>
          <CardDescription>Define size and color combinations for your garment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sizeColorEntries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg">
              <div className="col-span-3 space-y-2">
                <Label>Size</Label>
                <Select 
                  value={entry.size} 
                  onValueChange={(value) => updateSizeColorEntry(entry.id, 'size', value)}
                  disabled={isContractFinalized}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-5 space-y-2">
                <Label>Color</Label>
                <Input
                  value={entry.color}
                  onChange={(e) => updateSizeColorEntry(entry.id, 'color', e.target.value)}
                  placeholder="e.g., Navy Blue, #1a2b3c"
                  disabled={isContractFinalized}
                />
              </div>

              <div className="col-span-3 space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={entry.quantity}
                  onChange={(e) => updateSizeColorEntry(entry.id, 'quantity', e.target.value)}
                  placeholder="100"
                  min={0}
                  disabled={isContractFinalized}
                />
              </div>

              <div className="col-span-1">
                {sizeColorEntries.length > 1 && !isContractFinalized && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeSizeColorEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Print & Color Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Print & Color Notes</CardTitle>
          </div>
          <CardDescription>Specify any printing or color treatments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Print Type</Label>
              <Select 
                value={printType} 
                onValueChange={(val) => { 
                  if (!isContractFinalized) { 
                    setPrintType(val); 
                    setHasUnsavedChanges(true); 
                  }
                }}
                disabled={isContractFinalized}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {printTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color Notes</Label>
            <Textarea
              value={colorNotes}
              onChange={(e) => { 
                if (!isContractFinalized) { 
                  setColorNotes(e.target.value); 
                  setHasUnsavedChanges(true); 
                }
              }}
              placeholder="Describe your color preferences, Pantone references, or any specific color requirements..."
              rows={3}
              disabled={isContractFinalized}
            />
          </div>
        </CardContent>
      </Card>

      {/* Construction Notes Card */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Construction Notes</CardTitle>
          <CardDescription>Any special construction details or requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={constructionNotes}
            onChange={(e) => { 
              if (!isContractFinalized) { 
                setConstructionNotes(e.target.value); 
                setHasUnsavedChanges(true); 
              }
            }}
            placeholder="Add any special construction details, seam types, stitching preferences, hardware requirements, etc..."
            rows={4}
            disabled={isContractFinalized}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
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
        <Button 
          onClick={handleContinue} 
          className="gap-2"
          disabled={!isFiberPercentValid && fabrics.some(f => f.type)}
        >
          Continue to Tech Pack
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FabricColorStage;