import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDesigns } from '@/data/workflowData';
import { ArrowLeft } from 'lucide-react';
import { WorkflowProvider, useWorkflow } from '@/context/WorkflowContext';
import { TopLevelStepper } from '@/components/designer/TopLevelStepper';
import { TechPackSectionNav, TechPackSection } from '@/components/designer/TechPackSectionNav';
import { ProductionStepper, ProductionStep } from '@/components/designer/ProductionStepper';
import { TechPackReviewStatus } from '@/components/designer/TechPackReviewStatus';
import { ProductionParametersStatus } from '@/components/designer/ProductionParametersStatus';
import TechPackStage from '@/components/workflow/TechPackStage';
import FactoryMatchStage from '@/components/workflow/FactoryMatchStage';
import PaymentStage from '@/components/workflow/PaymentStage';
import ProductionStage from '@/components/workflow/ProductionStage';
import SampleStage from '@/components/workflow/SampleStage';
import QualityStage from '@/components/workflow/QualityStage';
import ShippingStage from '@/components/workflow/ShippingStage';
import { supabase } from '@/integrations/supabase/client';

type TopLevelStep = 'design' | 'tech-pack' | 'production';

const WorkspaceContent = ({ design }: { design: any }) => {
  const [topLevelStep, setTopLevelStep] = useState<TopLevelStep>('tech-pack');
  const [techPackSection, setTechPackSection] = useState<TechPackSection>('overview');
  const [productionStep, setProductionStep] = useState<ProductionStep>('tech-pack-review');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('design_id', design.id)
          .maybeSingle();
        
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Subscribe to order updates
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.new.design_id === design.id) {
            setOrder(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  const designComplete = true; // Design phase is complete
  const techPackComplete = !!order?.tech_pack_feasible;

  const renderTechPackSection = () => {
    switch (techPackSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tech Pack Overview</h2>
            <TechPackStage design={design} />
          </div>
        );
      case 'design-details':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Design Details</h2>
            <p className="text-muted-foreground">Add design details, sketches, and reference images.</p>
            {/* Design details content */}
          </div>
        );
      case 'specifications':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Specifications</h2>
            <p className="text-muted-foreground">Define construction specs, stitching details, and finishing requirements.</p>
            {/* Specifications content */}
          </div>
        );
      case 'fabric-color':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Fabric & Color</h2>
            <p className="text-muted-foreground">Specify fabric types, colors, and material requirements.</p>
            {/* Fabric & Color content */}
          </div>
        );
      case 'measurements':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Measurements</h2>
            <p className="text-muted-foreground">Add size charts and measurement specifications.</p>
            {/* Measurements content */}
          </div>
        );
      case 'attachments':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Attachments</h2>
            <p className="text-muted-foreground">Upload additional files and documents.</p>
            {/* Attachments content */}
          </div>
        );
      default:
        return <TechPackStage design={design} />;
    }
  };

  const renderProductionStep = () => {
    switch (productionStep) {
      case 'tech-pack-review':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tech Pack Review</h2>
            <p className="text-muted-foreground mb-4">
              Manufacturer reviews your tech pack for producibility. You'll be notified of their decision.
            </p>
            <TechPackReviewStatus order={order} />
          </div>
        );
      case 'production-parameters':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Production Parameters</h2>
            <p className="text-muted-foreground mb-4">
              Review and approve production parameters submitted by the manufacturer.
            </p>
            <ProductionParametersStatus 
              order={order} 
              onApprove={() => setOrder((prev: any) => ({ ...prev, production_params_approved: true }))}
              onReject={() => setOrder((prev: any) => ({ ...prev, production_params_approved: false }))}
            />
          </div>
        );
      case 'sample-development':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Sample Development</h2>
            <SampleStage design={design} />
          </div>
        );
      case 'quality-check':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Quality Check</h2>
            <QualityStage design={design} />
          </div>
        );
      case 'shipping':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Shipping & Logistics</h2>
            <ShippingStage design={design} />
          </div>
        );
      default:
        return null;
    }
  };

  const renderTopLevelContent = () => {
    switch (topLevelStep) {
      case 'design':
        return (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold mb-4">Design</h2>
              <p className="text-muted-foreground">Design phase content here.</p>
            </div>
          </div>
        );
      case 'tech-pack':
        return (
          <div className="flex gap-6">
            {/* Left Sidebar - Section Navigation */}
            <div className="w-56 shrink-0">
              <Card className="sticky top-6 border-border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm">Tech Pack Sections</h3>
                </div>
                <div className="p-3">
                  <TechPackSectionNav 
                    activeSection={techPackSection} 
                    onSectionChange={setTechPackSection} 
                  />
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {renderTechPackSection()}
            </div>
          </div>
        );
      case 'production':
        return (
          <div className="flex gap-6">
            {/* Left Sidebar - Production Steps */}
            <div className="w-56 shrink-0">
              <Card className="sticky top-6 border-border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-sm">Production Pipeline</h3>
                </div>
                <div className="p-3">
                  <ProductionStepper 
                    activeStep={productionStep} 
                    onStepChange={setProductionStep}
                    order={order}
                  />
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {renderProductionStep()}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Top Level Stepper */}
      <TopLevelStepper
        currentStep={topLevelStep}
        onStepChange={setTopLevelStep}
        designComplete={designComplete}
        techPackComplete={techPackComplete}
      />

      {/* Content based on top level step */}
      {renderTopLevelContent()}
    </div>
  );
};

const DesignWorkspace = () => {
  const { id } = useParams();
  const design = mockDesigns.find(d => d.id === id);

  if (!design) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-24 mt-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Design not found</h1>
          <Button asChild>
            <Link to="/workflow">Back to Workflow</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'delayed': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'action-required': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <WorkflowProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-6 py-6 mt-20 max-w-7xl">
          {/* Compact Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{design.name}</h1>
                <Badge variant="outline" className={getStatusColor(design.status)}>
                  {design.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

            {/* Compact Progress Bar */}
            <Card className="border-border">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium text-foreground">{design.progress}%</span>
                    </div>
                    <Progress value={design.progress} className="h-1.5" />
                  </div>
                  <div className="text-xs text-muted-foreground">{design.nextAction}</div>
                </div>
              </div>
            </Card>
          </div>

          <WorkspaceContent design={design} />
        </main>
      </div>
    </WorkflowProvider>
  );
};

export default DesignWorkspace;
