import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Factory, MapPin, Clock, Users } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';

interface FactorySelectionStageProps {
  design: any;
}

const FactorySelectionStage = ({ design }: FactorySelectionStageProps) => {
  const { currentStage, setCurrentStage, markStageComplete } = useWorkflow();

  const handleBack = () => {
    setCurrentStage('tech-pack');
  };

  const handleContinue = () => {
    console.log('is this not passing forward');
    markStageComplete('factory-selection');
    setCurrentStage('factory-match');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Find a Maker</h2>
        <p className="text-muted-foreground mt-1">
          Your tech pack is ready! Now let's find the perfect manufacturer for your design.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Factory className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Ready to Match</h3>
              <p className="text-sm text-muted-foreground">
                We'll analyze your specifications and find manufacturers that best fit your needs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">What happens next</CardTitle>
          <CardDescription>Here's how the matching process works</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">1</div>
              <div>
                <p className="font-medium text-foreground">Set Your Preferences</p>
                <p className="text-sm text-muted-foreground">Tell us your quantity, budget, location preferences, and timeline</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">2</div>
              <div>
                <p className="font-medium text-foreground">Review Matches</p>
                <p className="text-sm text-muted-foreground">See manufacturers ranked by compatibility with your project</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">3</div>
              <div>
                <p className="font-medium text-foreground">Send Requests</p>
                <p className="text-sm text-muted-foreground">Reach out to multiple manufacturers and compare responses</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium">4</div>
              <div>
                <p className="font-medium text-foreground">Choose Your Partner</p>
                <p className="text-sm text-muted-foreground">Select the manufacturer that's right for you and begin production</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <MapPin className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">15+</p>
            <p className="text-xs text-muted-foreground">Countries</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">50+</p>
            <p className="text-xs text-muted-foreground">Manufacturers</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">48h</p>
            <p className="text-xs text-muted-foreground">Avg. Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Tech Pack
        </Button>
        <Button onClick={handleContinue} className="gap-2">
          Find Manufacturers
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default FactorySelectionStage;
