import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { garmentTypes, garmentTemplates, getTemplatesByTypeAndGender, GarmentTemplate } from '@/data/garmentTemplates';
import { Crown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useElementContext } from '@/context/ElementContext';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CanvasElementType } from '@/types/elements';

const getTemplateThumbnailSrc = (preview: string) => {
  if (!preview.startsWith('/lovable-uploads/')) return preview;
  return preview.replace('/lovable-uploads/', '/lovable-uploads/thumbs/');
};

interface ImprovedTemplateSelectorProps {
  selectedTemplate: string;
  selectedGender: 'male' | 'female';
  onTemplateChange: (templateId: string) => void;
  onGenderChange?: (gender: 'male' | 'female') => void;
  onAutoActivateTextTool?: () => void;
}
const ImprovedTemplateSelector = ({
  selectedTemplate,
  selectedGender,
  onTemplateChange,
  onGenderChange,
  onAutoActivateTextTool
}: ImprovedTemplateSelectorProps) => {
  const [selectedGarmentType, setSelectedGarmentType] = useState<string>('tshirt');
  const [searchQuery, setSearchQuery] = useState('');
  const [multiSelect, setMultiSelect] = useState(false);
  const {
    addCanvasElement,
    canvasElements
  } = useElementContext();

  // Refined template list based on gender/type
  const filteredTemplates = getTemplatesByTypeAndGender(selectedGarmentType, selectedGender).filter(template => template.name.toLowerCase().includes(searchQuery.toLowerCase()) || (template.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()));

  useEffect(() => {
    garmentTemplates.forEach((template) => {
      if (!template.preview.startsWith('/') && !template.preview.startsWith('http')) return;
      const image = new Image();
      image.src = getTemplateThumbnailSrc(template.preview);
      image.decoding = 'async';
    });
  }, []);

  const handleTemplateClick = (template: GarmentTemplate) => {
    if (multiSelect) {
      let previewElement: React.ReactElement;
      if (template.preview.startsWith('/') || template.preview.startsWith('http')) {
        previewElement = React.createElement('img', {
          src: template.preview,
          alt: template.name,
          className: "w-full h-full object-contain"
        });
      } else {
        previewElement = React.createElement('span', {
          className: "text-4xl"
        }, template.preview);
      }
      const newGarmentElement: CanvasElementType = {
        id: `garment-${Date.now()}`,
        name: template.name,
        category: 'garment',
        type: 'garment',
        position: {
          x: 50,
          y: 50
        },
        rotation: 0,
        scale: 1,
        zIndex: (canvasElements?.length || 0) + 5,
        width: 300,
        height: 380,
        preview: previewElement,
        // Garment specific properties
        templateId: template.id,
        colors: {
          body: '#ffffff',
          sleeves: '#ffffff',
          collar: '#ffffff',
          stripesColor: '#e5e5e5'
        },
        patterns: {
          body: '',
          sleeves: '',
          collar: '',
          stripesColor: ''
        },
        uploadedPatterns: {
          body: '',
          sleeves: '',
          collar: '',
          stripesColor: ''
        },
        fabric: {
          name: 'Cotton',
          texture: 'cotton',
          roughness: 0.8,
          metalness: 0.1
        },
        buttons: []
      } as CanvasElementType;
      addCanvasElement(newGarmentElement);
    } else {
      onTemplateChange(template.id);
      if (onAutoActivateTextTool) onAutoActivateTextTool();
    }
  };
  const scrollGarmentTypes = (direction: 'left' | 'right') => {
    const container = document.getElementById('garment-types-scroll');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  return <div className="bg-card border border-border rounded-xl shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search design templates..." className="pl-9 h-9 bg-muted border-border rounded-lg text-xs focus:ring-2 focus:ring-ring/40 focus:border-ring/40" />
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-foreground mb-1">Design Templates</h2>
            <p className="text-xs text-muted-foreground">Choose from professional garment templates</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="multi-select-mode" checked={multiSelect} onCheckedChange={setMultiSelect} className="data-[state=checked]:bg-primary scale-75" />
            <Label htmlFor="multi-select-mode" className="text-xs font-medium text-foreground">
              Multi-select
            </Label>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Horizontal scrollable garment types */}
          <div className="relative mb-4">
            <button onClick={() => scrollGarmentTypes('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg rounded-full p-1.5 hover:bg-muted transition-colors" style={{
            marginLeft: '-8px'
          }}>
              <ChevronLeft className="w-3 h-3 text-muted-foreground" />
            </button>
            
            <div id="garment-types-scroll" className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-4">
              {garmentTypes.map(type => <button key={type.id} onClick={() => setSelectedGarmentType(type.id)} className={`
                    flex-shrink-0 rounded-lg px-3 py-2 font-medium text-xs border-2
                    transition-all duration-200 flex items-center gap-2 min-w-[100px]
                    ${selectedGarmentType === type.id ? "border-primary bg-primary/10 text-primary shadow-md" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted"}
                  `}>
                  
                  <span className="whitespace-nowrap">{type.name}</span>
                </button>)}
            </div>
            
            <button onClick={() => scrollGarmentTypes('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg rounded-full p-1.5 hover:bg-muted transition-colors" style={{
            marginRight: '-8px'
          }}>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          <div className="mb-3">
            <div className="inline-flex items-center bg-muted text-foreground rounded-md px-2 py-1 text-xs font-medium">
              {filteredTemplates.length} templates available
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredTemplates.map(template => <Card key={template.id} className={`
                  group rounded-lg border-2 transition-all duration-200 cursor-pointer overflow-hidden
                  ${selectedTemplate === template.id ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/40 hover:shadow-sm"}
                `} onClick={() => handleTemplateClick(template)}>
                <CardContent className="p-3">
                  <div className="w-full h-14 rounded-md bg-muted flex items-center justify-center mb-2 overflow-hidden">
                    {template.preview.startsWith('/') || template.preview.startsWith('http') ? (
                      <img
                        src={getTemplateThumbnailSrc(template.preview)}
                        alt={template.name}
                        className="w-full h-full object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    ) : <span className="text-lg">{template.preview}</span>}
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-medium text-foreground text-xs mb-1 flex items-center justify-center gap-1">
                      {template.name}
                      {template.isPremium && <Crown className="w-2 h-2 text-yellow-500" />}
                    </h3>
                    
                    <p className="text-[10px] text-muted-foreground mb-1.5 leading-tight">{template.description}</p>
                    
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] bg-muted text-foreground px-1 py-0">
                        {template.category}
                      </Badge>
                      {template.isPremium ? <Badge className="text-[9px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-1 py-0">
                          Premium ${template.price}
                        </Badge> : <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/30 px-1 py-0">
                          Free
                        </Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>

          {filteredTemplates.length === 0 && <div className="text-center py-8 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="text-2xl text-muted-foreground">🔍</div>
                <h3 className="text-sm font-medium text-foreground">No templates found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your search or garment type selection.</p>
              </div>
            </div>}
        </div>
      </ScrollArea>
    </div>;
};
export default ImprovedTemplateSelector;
