import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileCheck, Sparkles, Loader2, Plus, X, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StageNavigation } from './StageNavigation';


interface Design {
  id: string;
  name: string;
  design_file_url: string | null;
}

interface TechPackStageProps {
  design: Design;
}

interface TechPackDraft {
  header: {
    styleName: string;
    styleNumber: string;
    category: string;
    season: string;
    createdBy: string;
    brand: string;
  };
  designOverview: any;
  materials: any;
  measurements: Array<{ name: string; value: string }>;
  fabricSpecs: Array<{ 
    type: string; 
    details: string; 
    gsm?: string;
    color?: string;
    supplier?: string;
    finish?: string;
  }>;
  constructionNotes: string;
  markdownPreview: string;
  designImageUrl?: string;
}

const DraftPreview: React.FC<{ techPackDraft: TechPackDraft }> = ({ techPackDraft }) => {
  const header = (techPackDraft.header || {}) as { styleName?: string; styleNumber?: string; category?: string; season?: string; brand?: string };
  const designOverview = (techPackDraft.designOverview || {}) as Record<string, any>;
  const materials = (techPackDraft.materials || {}) as Record<string, any>;

  

  return (
    <div className="space-y-6 text-sm">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Header</h3>
          <p><strong>Style Name:</strong> {header.styleName}</p>
          <p><strong>Style Number:</strong> {header.styleNumber}</p>
          <p><strong>Category:</strong> {header.category}</p>
          <p><strong>Season:</strong> {header.season}</p>
          <p><strong>Brand:</strong> {header.brand}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Design Overview</h3>
          {designOverview.style_description && (
            <p><strong>Description:</strong> {designOverview.style_description}</p>
          )}
          {designOverview.silhouette && (
            <p><strong>Silhouette:</strong> {designOverview.silhouette}</p>
          )}
          {designOverview.fit && (
            <p><strong>Fit:</strong> {designOverview.fit}</p>
          )}
          {Array.isArray(designOverview.key_features) && designOverview.key_features.length > 0 && (
            <div>
              <strong>Key Features:</strong>
              <ul className="list-disc ml-6">
                {designOverview.key_features.map((feature: string, i: number) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Materials</h3>
          {materials.shell_fabric && (
            <p><strong>Shell:</strong> {typeof materials.shell_fabric === 'string' ? materials.shell_fabric : JSON.stringify(materials.shell_fabric)}</p>
          )}
          {materials.lining_fabric && (
            <p><strong>Lining:</strong> {typeof materials.lining_fabric === 'string' ? materials.lining_fabric : JSON.stringify(materials.lining_fabric)}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">Markdown Preview</h3>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap">
            {techPackDraft.markdownPreview}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

// Editable draft component
const DraftEditor: React.FC<{ 
  techPackDraft: TechPackDraft;
  onChange: (draft: TechPackDraft) => void;
}> = ({ techPackDraft, onChange }) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Header Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Style Name</Label>
              <Input
                value={techPackDraft.header.styleName}
                onChange={(e) => onChange({
                  ...techPackDraft,
                  header: { ...techPackDraft.header, styleName: e.target.value }
                })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Style Number</Label>
              <Input
                value={techPackDraft.header.styleNumber}
                onChange={(e) => onChange({
                  ...techPackDraft,
                  header: { ...techPackDraft.header, styleNumber: e.target.value }
                })}
                className="h-9 text-sm"
                placeholder="e.g., TP-2024-001"
              />
            </div>
            <div>
              <Label className="text-xs">Brand</Label>
              <Input
                value={techPackDraft.header.brand}
                onChange={(e) => onChange({
                  ...techPackDraft,
                  header: { ...techPackDraft.header, brand: e.target.value }
                })}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Season</Label>
              <Input
                value={techPackDraft.header.season}
                onChange={(e) => onChange({
                  ...techPackDraft,
                  header: { ...techPackDraft.header, season: e.target.value }
                })}
                className="h-9 text-sm"
                placeholder="e.g., Spring/Summer 2025"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Overview */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Design Overview</h3>
          <div>
            <Label className="text-xs">Style Description</Label>
            <Textarea
              value={techPackDraft.designOverview?.style_description || ''}
              onChange={(e) => onChange({
                ...techPackDraft,
                designOverview: {
                  ...techPackDraft.designOverview,
                  style_description: e.target.value
                }
              })}
              className="text-sm"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold text-sm">Materials</h3>
          <div>
            <Label className="text-xs">Shell Fabric</Label>
            <Input
              value={
                typeof techPackDraft.materials?.shell_fabric === 'string'
                  ? techPackDraft.materials.shell_fabric
                  : JSON.stringify(techPackDraft.materials?.shell_fabric || '')
              }
              onChange={(e) => onChange({
                ...techPackDraft,
                materials: {
                  ...techPackDraft.materials,
                  shell_fabric: e.target.value
                }
              })}
              className="h-9 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Construction Notes */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-sm">Construction Notes</h3>
          <Textarea
            value={techPackDraft.constructionNotes}
            onChange={(e) => onChange({ ...techPackDraft, constructionNotes: e.target.value })}
            className="text-sm"
            rows={4}
            placeholder="Add construction details..."
          />
        </CardContent>
      </Card>
    </div>
  );
};

const TechPackStage = ({ design }: TechPackStageProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [generatedTechPackBlob, setGeneratedTechPackBlob] = useState<Blob | null>(null);
  const [designFileUrl, setDesignFileUrl] = useState<string>('');
  const [measurements, setMeasurements] = useState<Array<{ name: string; value: string }>>([
    { name: '', value: '' }
  ]);
  const [fabricSpecs, setFabricSpecs] = useState<Array<{ 
    type: string; 
    details: string; 
    gsm?: string;
    color?: string;
    supplier?: string;
    finish?: string;
  }>>([
    { type: '', details: '', gsm: '', color: '', supplier: '', finish: '' }
  ]);
  const [constructionNotes, setConstructionNotes] = useState('');
  
  const [techPackDraft, setTechPackDraft] = useState<TechPackDraft | null>(null);
  const [showDraftEditor, setShowDraftEditor] = useState(false);
  const [isFinalizingDraft, setIsFinalizingDraft] = useState(false);
  const [draftMode, setDraftMode] = useState<'view' | 'edit'>('view');
  const [uploadedTechPack, setUploadedTechPack] = useState<File | null>(null);
  const [existingTechPackUrl, setExistingTechPackUrl] = useState<string | null>(null);

  const designFileInputRef = useRef<HTMLInputElement>(null);
  const techPackInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (design.design_file_url) {
      setDesignFileUrl(design.design_file_url);
    }

    // Load existing tech pack if available
    const loadExistingTechPack = async () => {
      try {
        const { data: techpackData } = await supabase
          .from('techpacks')
          .select('pdf_url')
          .eq('design_id', design.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (techpackData?.pdf_url) {
          setExistingTechPackUrl(techpackData.pdf_url);
        }
      } catch (error) {
        console.error('Error loading existing tech pack:', error);
      }
    };

    loadExistingTechPack();
  }, [design.design_file_url, design.id]);

  const handleNext = () => {
    return true;
  };

  // FIXED: Generate Draft using Supabase Edge Function (Deno orchestrator)
  const handleGenerateTechPack = async () => {
    if (!designFileUrl) {
      toast.error('Please upload a design file first');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Generating tech pack draft via Deno edge function...');

      // Call Supabase Edge Function with action in body
      const { data, error } = await supabase.functions.invoke('generate-techpack', {
        body: {
          action: 'draft',
          designData: {
            name: design.name,
            garmentType: measurements.find(m => m.name.toLowerCase().includes('type'))?.value || 'Garment',
            designImageUrl: designFileUrl,
            measurements: measurements.filter(m => m.name && m.value),
            fabricSpecs: fabricSpecs.filter(f => f.type && f.details),
            constructionNotes
          },
          _timestamp: Date.now() // Cache buster
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('✅ Draft received:', data);
      console.log('📋 Response keys:', Object.keys(data || {}));

      // Handle the response format we're actually getting
      // Extract agent results
      const agentResults = data.agentResults || {};
      const designSection = agentResults.designSection || {};
      const materialsSection = agentResults.materialsSection || {};
      const svgFeatures = agentResults.svgAnalysis || {};

      // Build draft structure from the response
      setTechPackDraft({
        header: {
          styleName: design.name,
          styleNumber: '',
          category: measurements.find(m => m.name.toLowerCase().includes('type'))?.value || 'Garment',
          season: '',
          createdBy: 'AI Agent System',
          brand: ''
        },
        designOverview: designSection,
        materials: materialsSection,
        measurements: measurements.filter(m => m.name && m.value),
        fabricSpecs: fabricSpecs.filter(f => f.type && f.details),
        constructionNotes: constructionNotes,
        markdownPreview: data.techPackContent || '',
        designImageUrl: designFileUrl // Include design image URL
      });

      setShowDraftEditor(true);
      setDraftMode('view');
      toast.success('✨ Draft generated successfully!');

    } catch (error) {
      console.error('❌ Error generating draft:', error);
      toast.error(`Failed to generate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Finalize draft - regenerate PDF with edited content
  const handleFinalizeDraft = async () => {
    if (!techPackDraft) return;

    setIsFinalizingDraft(true);
    try {
      console.log('📄 Finalizing draft - regenerating tech pack with edits...');

      // Call edge function again with the EDITED draft data
      const { data, error } = await supabase.functions.invoke('generate-techpack', {
        body: {
          action: 'regenerate', // Tell it to regenerate with new data
          designData: {
            name: techPackDraft.header.styleName,
            garmentType: techPackDraft.header.category,
            designImageUrl: designFileUrl,
            measurements: techPackDraft.measurements,
            fabricSpecs: techPackDraft.fabricSpecs,
            constructionNotes: techPackDraft.constructionNotes
          },
          // Pass the edited sections
          customSections: {
            designOverview: techPackDraft.designOverview,
            materials: techPackDraft.materials
          }
        }
      });

      if (error) throw error;

      // Extract PDF from response
      if (!data?.pdfData) {
        throw new Error('No PDF data received');
      }

      // Convert base64 to blob
      const byteCharacters = atob(data.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      setGeneratedTechPackBlob(blob);
      setShowDraftEditor(false);
      setShowConfirmDialog(true);
      
      toast.success('✅ Tech pack finalized with your edits!');

    } catch (error) {
      console.error('❌ Error finalizing:', error);
      toast.error(`Failed to finalize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFinalizingDraft(false);
    }
  };

  const handleConfirmTechPack = async () => {
    if (!generatedTechPackBlob) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${design.id}-techpack-${Date.now()}.pdf`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fileName, generatedTechPackBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      // Save to database
      const { error: techpackError } = await supabase
        .from('techpacks')
        .insert({
          design_id: design.id,
          pdf_url: publicUrl,
          pdf_file_id: fileName,
          generated_by: 'ai',
        });

      if (techpackError) throw techpackError;

      // Download PDF
      const url = URL.createObjectURL(generatedTechPackBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${design.name}-TechPack.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowConfirmDialog(false);
      toast.success('Tech pack saved and downloaded!');

    } catch (error) {
      console.error('Error saving tech pack:', error);
      toast.error('Failed to save tech pack');
    }
  };

  const handleDesignFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${design.id}-design-${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      setDesignFileUrl(publicUrl);
      toast.success(`Design file uploaded!`);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload design file');
    }
  };

  const handleTechPackUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOC file');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${design.id}-techpack-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('design-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('design-files')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('techpacks')
        .insert({
          design_id: design.id,
          pdf_url: publicUrl,
          pdf_file_id: fileName,
          generated_by: 'user-upload',
        });

      if (dbError) throw dbError;

      setUploadedTechPack(file);
      setExistingTechPackUrl(publicUrl);
      toast.success(`Tech pack "${file.name}" uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading tech pack:', error);
      toast.error('Failed to upload tech pack');
    }
  };

  // Track incomplete items for progress indicator
  const incompleteItems = [
    !designFileUrl && 'Design file',
    measurements.every(m => !m.name && !m.value) && 'Measurements',
    fabricSpecs.every(f => !f.type && !f.details) && 'Fabric specs',
    !existingTechPackUrl && !techPackDraft && 'Tech pack generation'
  ].filter(Boolean) as string[];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Create Tech Pack</h2>
        <p className="text-muted-foreground">Upload design and add specifications</p>
      </div>

      {/* Incomplete Status Banner */}
      {incompleteItems.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <div className="w-5 h-5 text-amber-600 shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <p className="font-medium text-amber-800 text-sm">Incomplete</p>
            <p className="text-sm text-amber-700">
              Missing: {incompleteItems.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Design Upload */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Design File (SVG)</h3>
        <Card className="border-border">
          <CardContent className="p-5">
            <input
              ref={designFileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleDesignFileUpload}
              className="hidden"
            />
            {designFileUrl ? (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Design uploaded</p>
                      <p className="text-xs text-muted-foreground">Click to change</p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => designFileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Different File
                </Button>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer h-[200px] flex flex-col items-center justify-center"
                onClick={() => designFileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Upload design (SVG only)</p>
                <p className="text-xs text-muted-foreground">Vector format preserves quality</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Measurements */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Measurements</h3>
        <Card className="border-border">
          <CardContent className="p-5 space-y-3">
            {measurements.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Name (e.g., Chest)"
                  value={m.name}
                  onChange={(e) => {
                    const updated = [...measurements];
                    updated[i].name = e.target.value;
                    setMeasurements(updated);
                  }}
                  className="flex-1 h-9"
                />
                <Input
                  placeholder="Value (e.g., 42 in)"
                  value={m.value}
                  onChange={(e) => {
                    const updated = [...measurements];
                    updated[i].value = e.target.value;
                    setMeasurements(updated);
                  }}
                  className="w-36 h-9"
                />
                {measurements.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={() => setMeasurements(measurements.filter((_, idx) => idx !== i))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeasurements([...measurements, { name: '', value: '' }])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Measurement
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Fabric Specs */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Fabric Specifications</h3>
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            {fabricSpecs.map((spec, i) => (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Fabric Type</Label>
                    <Input
                      placeholder="e.g., Cotton Jersey"
                      value={spec.type}
                      onChange={(e) => {
                        const updated = [...fabricSpecs];
                        updated[i].type = e.target.value;
                        setFabricSpecs(updated);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Color</Label>
                    <Input
                      placeholder="e.g., Navy Blue"
                      value={spec.color || ''}
                      onChange={(e) => {
                        const updated = [...fabricSpecs];
                        updated[i].color = e.target.value;
                        setFabricSpecs(updated);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Composition</Label>
                  <Input
                    placeholder="e.g., 100% Organic Cotton"
                    value={spec.details}
                    onChange={(e) => {
                      const updated = [...fabricSpecs];
                      updated[i].details = e.target.value;
                      setFabricSpecs(updated);
                    }}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">GSM</Label>
                    <Input
                      placeholder="180"
                      value={spec.gsm || ''}
                      onChange={(e) => {
                        const updated = [...fabricSpecs];
                        updated[i].gsm = e.target.value;
                        setFabricSpecs(updated);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Finish</Label>
                    <Input
                      placeholder="Enzyme Wash"
                      value={spec.finish || ''}
                      onChange={(e) => {
                        const updated = [...fabricSpecs];
                        updated[i].finish = e.target.value;
                        setFabricSpecs(updated);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Supplier</Label>
                    <Input
                      placeholder="Supplier Name"
                      value={spec.supplier || ''}
                      onChange={(e) => {
                        const updated = [...fabricSpecs];
                        updated[i].supplier = e.target.value;
                        setFabricSpecs(updated);
                      }}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                {fabricSpecs.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFabricSpecs(fabricSpecs.filter((_, idx) => idx !== i))}
                    className="w-full text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFabricSpecs([...fabricSpecs, { type: '', details: '', gsm: '', color: '', supplier: '', finish: '' }])}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Fabric Spec
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Construction Notes */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Construction Notes</h3>
        <Card className="border-border">
          <CardContent className="p-5">
            <Textarea
              placeholder="Add construction details, stitching requirements, special techniques..."
              value={constructionNotes}
              onChange={(e) => setConstructionNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>
      </section>

      {/* Generate & Upload Tech Pack */}
      <section>
        <h3 className="text-sm font-semibold mb-3">Tech Pack</h3>
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            {/* Generate with AI */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Generate a professional tech pack using AI. You'll be able to review and edit before finalizing.
              </p>
              <Button 
                className="w-full"
                onClick={handleGenerateTechPack}
                disabled={isGenerating || !designFileUrl}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Draft...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Tech Pack Draft with AI
                  </>
                )}
              </Button>
            </div>

            {/* Show if draft exists */}
            {techPackDraft && (
              <div className="rounded-lg bg-primary/10 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FileCheck className="w-4 h-4" />
                  Draft ready for review
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDraftEditor(true)}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Review Draft
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Upload existing tech pack */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Upload your existing tech pack document (PDF or DOC)
              </p>
              <input
                ref={techPackInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleTechPackUpload}
                className="hidden"
              />
              <Button 
                variant="outline"
                onClick={() => techPackInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedTechPack ? uploadedTechPack.name : 'Upload Existing Tech Pack'}
              </Button>
            </div>

            {/* Show existing tech pack */}
            {existingTechPackUrl && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <FileCheck className="w-4 h-4" />
                  Tech pack uploaded
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(existingTechPackUrl, '_blank')}
                    className="flex-1 text-xs"
                  >
                    View Tech Pack
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setExistingTechPackUrl(null);
                      setUploadedTechPack(null);
                    }}
                    className="text-xs"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <StageNavigation 
        onNext={handleNext}
        nextLabel="Continue to Find Manufacturer"
        showBack={true}
        showFinishLater={true}
        incompleteItems={incompleteItems}
      />

      {/* Draft Editor/Viewer Dialog */}
      <Dialog open={showDraftEditor} onOpenChange={setShowDraftEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Review Tech Pack Draft</DialogTitle>
                <DialogDescription>
                  {draftMode === 'view' ? 'Preview your tech pack' : 'Edit your tech pack before generating PDF'}
                </DialogDescription>
              </div>
              <div className="inline-flex rounded-full border p-1 text-xs">
                <button
                  onClick={() => setDraftMode('view')}
                  className={`px-3 py-1 rounded-full transition ${draftMode === 'view' ? 'bg-background shadow-sm' : ''}`}
                >
                  View
                </button>
                <button
                  onClick={() => setDraftMode('edit')}
                  className={`px-3 py-1 rounded-full transition ${draftMode === 'edit' ? 'bg-background shadow-sm' : ''}`}
                >
                  Edit
                </button>
              </div>
            </div>
          </DialogHeader>

          {techPackDraft && (
            <div className="space-y-6">
              {draftMode === 'view' ? (
                <DraftPreview techPackDraft={techPackDraft} />
              ) : (
                <DraftEditor 
                  techPackDraft={techPackDraft} 
                  onChange={setTechPackDraft}
                />
              )}
              
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowDraftEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleFinalizeDraft} disabled={isFinalizingDraft}>
                  {isFinalizingDraft ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    'Generate Final PDF'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Tech Pack?</DialogTitle>
            <DialogDescription>
              Your tech pack is ready to save and download
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmTechPack}>
              Save & Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechPackStage;