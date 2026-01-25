import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, ArrowLeft, Plus, X, Palette, Shirt, Clock, Lock } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsAdmin, useContractStatus } from '@/hooks/useContractStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FabricColorStageProps {
  design: any;
}

interface FabricEntry {
  id: string;
  type: string;
  fiberPercent: string;
  gsm: string;
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

const FabricColorStage = ({ design }: FabricColorStageProps) => {
  const { setCurrentStage, markStageComplete, workflowData, updateWorkflowData } = useWorkflow();
  const { isAdmin } = useIsAdmin();
  const { isContractFinalized } = useContractStatus(design?.id);

  const [fabrics, setFabrics] = useState<FabricEntry[]>([
    { id: '1', type: '', fiberPercent: '100', gsm: '' }
  ]);
  const [printType, setPrintType] = useState(workflowData.print || 'None');
  const [colorNotes, setColorNotes] = useState('');
  const [constructionNotes, setConstructionNotes] = useState(workflowData.constructionNotes || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);

  // Load existing specs
  useEffect(() => {
    const loadSpecs = async () => {
      const { data: specs } = await supabase
        .from('design_specs')
        .select('fabric_type, gsm, print_type, construction_notes')
        .eq('design_id', design.id)
        .maybeSingle();

      if (specs) {
        if (specs.fabric_type) {
          setFabrics([{ id: '1', type: specs.fabric_type, fiberPercent: '100', gsm: specs.gsm?.toString() || '' }]);
        }
        if (specs.print_type) setPrintType(specs.print_type);
        if (specs.construction_notes) setConstructionNotes(specs.construction_notes);
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
      fiberPercent: '', 
      gsm: '' 
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

  const handleBack = () => {
    setCurrentStage('specifications');
  };

  const handleSave = async () => {
    if (isContractFinalized) {
      toast.error('Cannot save changes after contract is finalized');
      return;
    }

    try {
      const primaryFabric = fabrics[0];
      
      const { data: existing } = await supabase
        .from('design_specs')
        .select('id')
        .eq('design_id', design.id)
        .maybeSingle();

      const specsData = {
        fabric_type: primaryFabric?.type || null,
        gsm: primaryFabric?.gsm ? parseInt(primaryFabric.gsm) : null,
        print_type: printType !== 'None' ? printType : null,
        construction_notes: constructionNotes || null,
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
        gsm: primaryFabric?.gsm || '',
        print: printType,
        constructionNotes 
      });
      markStageComplete('fabric-color');
    }
    setCurrentStage('tech-pack');
  };

  const handleFinishLater = async () => {
    if (hasUnsavedChanges && !isContractFinalized) {
      await handleSave();
    }
    setCurrentStage('tech-pack');
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
          <CardDescription>Define the fabrics used in your garment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fabrics.map((fabric, index) => (
            <div key={fabric.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-muted/30 rounded-lg">
              <div className="col-span-5 space-y-2">
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

              <div className="col-span-3 space-y-2">
                <Label>Fiber %</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={fabric.fiberPercent}
                    onChange={(e) => updateFabric(fabric.id, 'fiberPercent', e.target.value)}
                    placeholder="100"
                    max={100}
                    disabled={isContractFinalized}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="col-span-3 space-y-2">
                <Label>GSM</Label>
                <Input
                  type="number"
                  value={fabric.gsm}
                  onChange={(e) => updateFabric(fabric.id, 'gsm', e.target.value)}
                  placeholder="180"
                  disabled={isContractFinalized}
                />
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
        </CardContent>
      </Card>

      {/* Print & Color Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Print & Color</CardTitle>
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
        <Button onClick={handleContinue} className="gap-2">
          Continue to Tech Pack
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FabricColorStage;
