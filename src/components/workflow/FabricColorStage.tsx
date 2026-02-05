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
  imageUrl?: string;
}

interface PrintColorEntry {
  id: string;
  printType: string;
  notes: string;
  fileUrl?: string;
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
  const [printDirty, setPrintDirty] = useState(false);

  // Size/Color variants
  const [sizeColorEntries, setSizeColorEntries] = useState<SizeColorEntry[]>([
    { id: '1', size: 'M', color: '', quantity: '' }
  ]);

  const [printColorEntries, setPrintColorEntries] = useState<PrintColorEntry[]>([
    { id: '1', printType: 'None', notes: '', fileUrl: '' }
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
      const { data: variants } = await (supabase as any)
        .from('design_variants' as any)
        .select('id, size, color, quantity, image_url')
        .eq('design_id', design.id);

      if (variants && variants.length > 0) {
        setSizeColorEntries(
          variants.map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color ?? '',
            quantity: v.quantity?.toString() ?? '',
            imageUrl: v.image_url ?? undefined
          }))
        );
      }
      const { data: prints } = await (supabase as any)
        .from('design_print_colors' as any)
        .select('*')
        .eq('design_id', design.id);

      if (prints && prints.length > 0) {
        setPrintColorEntries(
          prints.map((p: any) => ({
            id: p.id,
            printType: p.print_type ?? 'None',
            notes: p.notes ?? '',
            fileUrl: p.file_url ?? undefined,
          }))
        );
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

  const addPrintEntry = () => {
  if (isContractFinalized) return;

  setPrintColorEntries(prev => [
    ...prev,
    {
      id: Date.now().toString(),
      printType: 'None',
      notes: '',
      fileUrl: undefined,
    }
  ]);

  setPrintDirty(true);
  setHasUnsavedChanges(true);
};

const removePrintEntry = (id: string) => {
  if (isContractFinalized) return;
  if (printColorEntries.length === 1) return;

  setPrintColorEntries(prev => prev.filter(p => p.id !== id));
  setPrintDirty(true);
  setHasUnsavedChanges(true);
};

const updatePrintEntry = (
  id: string,
  field: keyof PrintColorEntry,
  value: string
) => {
  if (isContractFinalized) return;

  setPrintColorEntries(prev =>
    prev.map(p => p.id === id ? { ...p, [field]: value } : p)
  );

  setPrintDirty(true);
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
const onVariantImageUpload = async (file: File, variantId: string) => {
  if (isContractFinalized) return;

  const ext = file.name.split('.').pop();
  const { data: { user } } = await supabase.auth.getUser();

  const path = `${user.id}/${design.id}/variants/${variantId}.${ext}`;
  await supabase.storage
    .from('design-files')
    .upload(path, file, { upsert: true });

  const { data } = supabase.storage
    .from('design-files')
    .getPublicUrl(path);

  setSizeColorEntries(prev =>
    prev.map(v =>
      v.id === variantId ? { ...v, imageUrl: data.publicUrl } : v
    )
  );

  setHasUnsavedChanges(true);
};

const onVariantImageRemove = (variantId: string) => {
  if (isContractFinalized) return;

  setSizeColorEntries(prev =>
    prev.map(v =>
      v.id === variantId ? { ...v, imageUrl: undefined } : v
    )
  );

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

  const onPrintImageUpload = async (file: File, printId: string) => {
  if (isContractFinalized) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const ext = file.name.split('.').pop();
  const path = `${user.id}/${design.id}/prints/${printId}.${ext}`;

  const { error } = await supabase.storage
    .from('design-files')
    .upload(path, file, { upsert: true });

  if (error) {
    toast.error('Failed to upload print image');
    return;
  }

  const { data } = supabase.storage
    .from('design-files')
    .getPublicUrl(path);

  setPrintColorEntries(prev =>
    prev.map(p =>
      p.id === printId ? { ...p, fileUrl: data.publicUrl } : p
    )
  );

  setPrintDirty(true);
  setHasUnsavedChanges(true);
};

const onPrintImageRemove = (printId: string) => {
  if (isContractFinalized) return;

  setPrintColorEntries(prev =>
    prev.map(p =>
      p.id === printId ? { ...p, fileUrl: undefined } : p
    )
  );

  setPrintDirty(true);
  setHasUnsavedChanges(true);
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
      const { data: hasVariant } = await (supabase as any)
        .from('design_variants' as any)
        .select('*')
        .eq('design_id', design.id)

      // Save variant images first.
      const variantsToSave = sizeColorEntries.map(entry => ({
        id: entry.id,
        size: entry.size,
        color: entry.color,
        quantity: entry.quantity,
        imageUrl: entry.imageUrl ?? null
      }));

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

      // Save variants to a separate table if needed
      if (hasVariant) {
        await (supabase as any)
        .from('design_variants' as any)
        .delete()
        .eq('design_id', design.id);
      }
    await (supabase as any)
      .from('design_variants' as any)
      .upsert(
        variantsToSave.map(v => ({
          design_id: design.id,
          size: v.size,
          color: v.color,
          quantity: parseInt(v.quantity) || null,
          image_url: v.imageUrl ?? null
        }))
      );

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
      if (printDirty) {
        // wipe old print entries
        await (supabase as any)
          .from('design_print_colors' as any)
          .delete()
          .eq('design_id', design.id);

        // insert current ones
        await (supabase as any)
          .from('design_print_colors' as any)
          .insert(
            printColorEntries.map(p => ({
              design_id: design.id,
              print_type: p.printType !== 'None' ? p.printType : null,
              notes: p.notes || null,
              file_url: p.fileUrl || null,
            }))
          );
      }
      setPrintDirty(false);
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
              <div className="col-span-2 space-y-2">
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

              <div className="col-span-2 space-y-2">
                <Label>Image</Label>
                <div className="relative">
                  {entry.imageUrl ? (
                    <div className="relative group">
                      <div className="w-12 h-12 rounded-md border overflow-hidden">
                        <img 
                          src={entry.imageUrl} 
                          alt={`${entry.size} ${entry.color}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {!isContractFinalized && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive/90 hover:bg-destructive text-white p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onVariantImageRemove(entry.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="w-12 h-12 border-2 border-dashed rounded-md flex items-center justify-center hover:bg-muted/50">
                        <Plus className="w-4 h-4 text-muted-foreground" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await onVariantImageUpload(file, entry.id);
                            }
                            // Reset the input to allow selecting the same file again
                            e.target.value = '';
                          }}
                        />
                      </div>
                    </label>
                  )}
                </div>
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-primary" />
        <CardTitle className="text-lg">Print & Color</CardTitle>
      </div>
      {!isContractFinalized && (
        <Button variant="outline" size="sm" onClick={addPrintEntry} className="gap-1">
          <Plus className="w-4 h-4" />
          Add Print
        </Button>
      )}
    </div>
    <CardDescription>
      Specify printing methods, images and color notes
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">
    {printColorEntries.map(entry => (
      <div
        key={entry.id}
        className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg"
      >
        {/* Print type */}
        <div className="col-span-3 space-y-2">
          <Label>Print Type</Label>
          <Select
            value={entry.printType}
            onValueChange={(v) =>
              updatePrintEntry(entry.id, 'printType', v)
            }
            disabled={isContractFinalized}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {printTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Notes */}
        <div className="col-span-4 space-y-2">
          <Label>Notes</Label>
          <Input
            value={entry.notes}
            onChange={(e) =>
              updatePrintEntry(entry.id, 'notes', e.target.value)
            }
            placeholder="Pantone, finish, layers, etc."
            disabled={isContractFinalized}
          />
        </div>

        {/* Artwork */}
        <div className="col-span-2 space-y-2">
          <Label>Artwork</Label>
          {entry.fileUrl ? (
            <div className="relative group">
              <div className="w-12 h-12 rounded-md border overflow-hidden">
                <img
                  src={entry.fileUrl}
                  alt="Print artwork"
                  className="w-full h-full object-cover"
                />
              </div>
              {!isContractFinalized && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive/90 text-white"
                  onClick={() => onPrintImageRemove(entry.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ) : (
            !isContractFinalized && (
              <label className="cursor-pointer">
                <div className="w-12 h-12 border-2 border-dashed rounded-md flex items-center justify-center hover:bg-muted/50">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        await onPrintImageUpload(file, entry.id);
                      }
                      e.target.value = '';
                    }}
                  />
                </div>
              </label>
            )
          )}
        </div>


        {/* Remove */}
        <div className="col-span-1">
          {printColorEntries.length > 1 && !isContractFinalized && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePrintEntry(entry.id)}
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