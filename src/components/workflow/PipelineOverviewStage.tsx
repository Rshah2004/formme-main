import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkflow } from '@/context/WorkflowContext';
import { Palette, FileText, Factory, Package, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

interface PipelineOverviewStageProps {
  design: any;
}

const PipelineOverviewStage = ({ design }: PipelineOverviewStageProps) => {
  const { setCurrentStage, markStageComplete } = useWorkflow();

  const handleContinue = () => {
    markStageComplete('overview');
    setCurrentStage('design');
  };

  const pipelineStages = [
    {
      id: 'tech-pack',
      title: 'Tech Pack',
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      description: 'Create your complete technical specification',
      steps: [
        'Upload design details and images',
        'Add measurements and specifications',
        'Select fabric type and colors'
      ]
    },
    {
      id: 'manufacturers',
      title: 'Manufacturers',
      icon: Factory,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      description: 'Find and finalize your manufacturing partner',
      steps: [
        'We match you with qualified manufacturers',
        'Review quotes and production details',
        'Select and finalize your manufacturer'
      ]
    },
    {
      id: 'production',
      title: 'Production',
      icon: Package,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      description: 'Oversee sampling and quality control',
      steps: [
        'Make payment to start production',
        'Review and approve samples',
        'Quality check before shipping'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Your Production Journey
              </h1>
              <p className="text-muted-foreground text-lg">
                We'll guide you through every step from design to delivery. Here's what to expect:
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Stages */}
      <div className="grid gap-4">
        {pipelineStages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <Card key={stage.id} className="border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Stage Number & Icon */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-14 h-14 rounded-xl ${stage.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${stage.color}`} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                    </div>
                    {index < pipelineStages.length - 1 && (
                      <div className="w-0.5 h-4 bg-border" />
                    )}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{stage.title}</h3>
                    <p className="text-muted-foreground mb-4">{stage.description}</p>
                    
                    <ul className="space-y-2">
                      {stage.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary/60 shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Design Info */}
      {design && (
        <Card className="border-border bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">You're working on</p>
                <h3 className="text-lg font-semibold text-foreground">{design.name}</h3>
                {design.category && (
                  <p className="text-sm text-muted-foreground">{design.category}</p>
                )}
              </div>
              {design.thumbnail_url && (
                <img 
                  src={design.thumbnail_url} 
                  alt={design.name}
                  className="w-16 h-16 rounded-lg object-cover border border-border"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleContinue} className="gap-2">
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PipelineOverviewStage;
