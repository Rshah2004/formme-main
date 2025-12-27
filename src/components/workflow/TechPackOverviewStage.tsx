import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Ruler, Palette, CheckCircle, ArrowRight } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';

interface TechPackOverviewStageProps {
  design: any;
}

const TechPackOverviewStage = ({ design }: TechPackOverviewStageProps) => {
  const { setCurrentStage, markStageComplete } = useWorkflow();

  const techPackSections = [
    {
      id: 'design',
      title: 'Design Details',
      description: 'Product name, description, and design files',
      icon: Image,
      status: design?.name ? 'complete' : 'incomplete',
    },
    {
      id: 'specifications',
      title: 'Specifications',
      description: 'Size charts, measurements, and construction details',
      icon: Ruler,
      status: design?.status !== 'draft' ? 'complete' : 'incomplete',
    },
    {
      id: 'fabric-color',
      title: 'Fabric & Color',
      description: 'Fabric type, GSM, print method, and colors',
      icon: Palette,
      status: design?.status !== 'draft' ? 'complete' : 'incomplete',
    },
  ];

  const completedCount = techPackSections.filter(s => s.status === 'complete').length;
  const isReady = completedCount === techPackSections.length;

  const handleContinue = () => {
    markStageComplete('tech-pack');
    setCurrentStage('factory-match');
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Tech Pack Overview
              </CardTitle>
              <CardDescription>
                Review your complete tech pack before finding manufacturers
              </CardDescription>
            </div>
            <Badge variant={isReady ? "default" : "secondary"}>
              {completedCount}/{techPackSections.length} Complete
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {techPackSections.map((section) => {
            const Icon = section.icon;
            const isComplete = section.status === 'complete';
            
            return (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{section.title}</h4>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentStage(section.id)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tech Pack Preview */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Tech Pack Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Product Name</p>
              <p className="font-medium">{design?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{design?.category || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline">{design?.status?.replace(/_/g, ' ') || 'Draft'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {design?.created_at ? new Date(design.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end">
        <Button 
          size="lg" 
          onClick={handleContinue}
          disabled={!isReady}
          className="gap-2"
        >
          Find Manufacturers
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default TechPackOverviewStage;