import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Plus, Clock, AlertCircle, CheckCircle, Package, Truck, FileCheck, Factory, Send, CreditCard, ArrowLeft, Lock } from 'lucide-react';
import { useDesigns } from '@/hooks/useDesigns';
import { useUserRole } from '@/hooks/useUserRole';
import { WorkflowProvider, useWorkflow } from '@/context/WorkflowContext';
import { supabase } from '@/integrations/supabase/client';
import { HorizontalProgressTabs } from '@/components/workflow/HorizontalProgressTabs';
import { ManufacturerFeedbackBanner } from '@/components/workflow/ManufacturerFeedbackBanner';
import { FeasibilitySummary } from '@/components/workflow/FeasibilitySummary';
import TechPackStage from '@/components/workflow/TechPackStage';
import TechPackOverviewStage from '@/components/workflow/TechPackOverviewStage';
import TechPackFeasibilityStage from '@/components/workflow/TechPackFeasibilityStage';
import DesignStage from '@/components/workflow/DesignStage';
import SpecificationsStage from '@/components/workflow/SpecificationsStage';
import FabricColorStage from '@/components/workflow/FabricColorStage';
import FactorySelectionStage from '@/components/workflow/FactorySelectionStage';
import FactoryMatchStage from '@/components/workflow/FactoryMatchStage';
import { ManufacturerSelectionStage } from '@/components/workflow/ManufacturerSelectionStage';
import WaitingForManufacturerStage from '@/components/workflow/WaitingForManufacturerStage';
import PaymentStage from '@/components/workflow/PaymentStage';
import ProductionStage from '@/components/workflow/ProductionStage';
import WaitingForSampleStage from '@/components/workflow/WaitingForSampleStage';
import SampleStage from '@/components/workflow/SampleStage';
import QualityStage from '@/components/workflow/QualityStage';
import ShippingStage from '@/components/workflow/ShippingStage';
import { FloatingMessagesWidget } from '@/components/workflow/FloatingMessagesWidget';
import { useRef} from "react";

const ProgressBar = () => {
  const { getProgress, completedStages } = useWorkflow();
  const progress = getProgress();
  
  return (
    <Card className="border-border">
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          <div className="text-xs text-muted-foreground">
            {progress === 0 ? 'Get started with Tech Pack' : `${completedStages.length} stages completed`}
          </div>
        </div>
      </div>
    </Card>
  );
};

const WorkspaceContent = ({ design }: { design: any }) => {
  const { currentStage } = useWorkflow();

  const renderStage = () => {
          console.log('what is the current stagee', currentStage);

    switch (currentStage) {
      // Creative stages
      case 'design':
        return <DesignStage design={design} />;
      case 'specifications':
        return <SpecificationsStage design={design} />;
      case 'fabric-color':
        return <FabricColorStage design={design} />;
      
      // Tech Pack stages (sub-navigation)
      case 'tech-pack':
      case 'tech-pack-overview':
        return <TechPackOverviewStage design={design} />;

        case 'factory-match':
        return <FactoryMatchStage design={design} />;

      case 'factory-selection':
        return <FactorySelectionStage design={design} />;
      case 'send-tech-pack':
      case 'waiting':
        return <WaitingForManufacturerStage design={design} />
        // return <TechPackFeasibilityStage design={design} />;
      case 'manufacture-selection':
        return <ManufacturerSelectionStage design={design} />
      // Production stages (sub-navigation: Payment, Sample Review, Quality Check, Delivery)
      case 'tech-pack-feasibility':
        return <ManufacturerSelectionStage design={design} />;
      case 'payment':
        return <PaymentStage design={design} />;
      case 'production':
        // Redirect to payment if someone lands on production stage
        return <PaymentStage design={design} />;
      case 'waiting-sample':
        return <WaitingForSampleStage design={design} />;
      case 'sample':
        return <SampleStage design={design} />;
      case 'quality':
        return <QualityStage design={design} />;
      case 'shipping':
        return <ShippingStage design={design} />;
      default:
        return <DesignStage design={design} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Manufacturer Feedback Banner - shows above stepper when issues exist */}
      <ManufacturerFeedbackBanner designId={design.id} />
      
      {/* Feasibility Summary - shows when feasibility is confirmed */}
      <FeasibilitySummary designId={design.id} />
      
      {/* Horizontal Progress Tabs */}
      <HorizontalProgressTabs />

      {/* Main Content Area */}
      <div className="w-full">
        {renderStage()}
      </div>
    </div>
  );
};

const Workflow = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { designs, loading } = useDesigns();
  const { role, loading: roleLoading } = useUserRole();
  const [initialStage, setInitialStage] = useState<string | null>(null);
  
  const designId = searchParams.get('designId');
  const selectedDesign = designId ? designs.find(d => d.id === designId) : null;
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);
  
  // Redirect to manufacturer dashboard if user is a manufacturer
  useEffect(() => {
    if (!roleLoading && role === 'manufacturer') {
      navigate('/manufacturer');
    }
  }, [role, roleLoading, navigate]);

const initializedRef = useRef(false);

  // Determine initial stage based on design selection
  useEffect(() => {
      if (initializedRef.current) return;

    if (!designId || !selectedDesign) {
      setInitialStage(null);
      return;
    }

    const determineStage = async () => {
      const urlStage = searchParams.get('stage');
      
      // If URL has a stage, use it
      if (urlStage) {
        setInitialStage(urlStage);
        return;
      }
      
      // First check if there's an order with a manufacturer assigned
      const { data: orderWithManufacturer } = await supabase
        .from('orders')
        .select('id, status, manufacturer_id, tech_pack_feasible, production_params_approved')
        .eq('design_id', designId)
        .not('manufacturer_id', 'is', null)
        .maybeSingle();

      // Check if contract is actually finalized (status is beyond sent_to_manufacturer)
      const contractFinalized = orderWithManufacturer && 
        orderWithManufacturer.status !== 'draft' && 
        orderWithManufacturer.status !== 'tech_pack_pending' &&
        orderWithManufacturer.status !== 'sent_to_manufacturer';

      // If contract is NOT finalized, stay on manufacture-selection (even if manufacturer submitted production params)
      if (orderWithManufacturer && !contractFinalized) {
        console.log('[Workflow] Contract not finalized, staying on manufacture-selection');
        setInitialStage('manufacture-selection');
        return;
      }

      // If contract IS finalized, go to payment stage (skipping production stage)
      if (orderWithManufacturer && contractFinalized) {
        console.log('[Workflow] Contract finalized, proceeding to payment');
        setInitialStage('payment');
        return;
      }
      
      // Check manufacturer match status
      const { data: acceptedMatches } = await supabase
        .from('manufacturer_matches')
        .select('status')
        .eq('design_id', designId)
        .eq('status', 'accepted');
      
      // If there are accepted matches but no order with manufacturer, go to manufacture-selection
      if (acceptedMatches && acceptedMatches.length > 0) {
        console.log('[Workflow] Manufacturers accepted, waiting for finalization');
        setInitialStage('manufacture-selection');
        return;
      }
      
      // Otherwise, determine stage from order status
      const { data: order } = await supabase
        .from('orders')
        .select('status, production_params_approved')
        .eq('design_id', designId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!order) {
        setInitialStage('design');
        return;
      }
      
      // Check if production params are approved to determine exact stage
      const productionParamsApproved = order.production_params_approved;

      // Map order status to workflow stage (design -> specs -> fabric -> tech-pack -> payment stages)
      const stageMap: Record<string, string> = {
        'draft': 'design',
        'tech_pack_pending': 'tech-pack',
        'sent_to_manufacturer': 'manufacture-selection',
        'manufacturer_review': 'payment',
        'production_approval': 'payment',
        'sample_development': 'sample',
        'quality_check': 'quality',
        'shipping': 'shipping',
        'delivered': 'shipping'
      };
      
      console.log('[Workflow] Order status:', order.status, 'Mapped stage:', stageMap[order.status]);
      setInitialStage(stageMap[order.status] || 'design');
    };
      initializedRef.current = true;

    determineStage();
  }, [designId, selectedDesign]);

  if (isAuthenticated === null || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  // Show sign-up prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Sign up to access your dashboard
                </h2>
                <p className="text-muted-foreground mb-8">
                  You need to create an account or sign in to view your production dashboard and manage your designs.
                </p>
                <Link to="/auth">
                  <Button size="lg" className="w-full">
                    Sign up or Sign in
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }
  
  const activeDesigns = designs.filter(d => d.status !== 'completed').length;
  const inSampling = designs.filter(d => d.status === 'sample_development').length;
  const inProduction = designs.filter(d => 
    d.status === 'production_approval' || d.status === 'quality_check'
  ).length;
  const awaitingApproval = 0; // TODO: Calculate based on orders requiring action

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'on-track': return 'default';
      case 'delayed': return 'secondary';
      case 'action-required': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'tech-pack': return <FileCheck className="w-4 h-4" />;
      case 'factory-match': return <Factory className="w-4 h-4" />;
      case 'waiting': return <Clock className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'production': return <Factory className="w-4 h-4" />;
      case 'waiting-sample': return <Clock className="w-4 h-4" />;
      case 'sample': return <Package className="w-4 h-4" />;
      case 'quality': return <CheckCircle className="w-4 h-4" />;
      case 'shipping': return <Truck className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-muted text-muted-foreground';
    if (status.includes('draft')) return 'bg-muted text-muted-foreground';
    if (status.includes('completed') || status.includes('delivered')) return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
  };

  // If a design is selected, show the workflow for that design
  if (designId && selectedDesign) {
    
    if (!initialStage) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-6 py-6 mt-20 max-w-7xl">
            <p className="text-muted-foreground">Loading workflow...</p>
          </main>
        </div>
      );
    }
    
    return (
      <WorkflowProvider key={designId} initialStage={initialStage}>
        <div className="min-h-screen bg-background">
          <Navbar />
          
          <main className="container mx-auto px-6 py-6 mt-20 max-w-7xl">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              className="mb-4" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>

            {/* Compact Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{selectedDesign.name}</h1>
                  <Badge variant="outline" className={getStatusColor(selectedDesign.status)}>
                    {selectedDesign.status?.replace(/_/g, ' ') || 'draft'}
                  </Badge>
                </div>
              </div>

              <ProgressBar />
            </div>

            <WorkspaceContent design={selectedDesign} />
            
            {/* Floating Messages Widget */}
            <FloatingMessagesWidget designId={designId} />
          </main>
        </div>
      </WorkflowProvider>
    );
  }

  // Otherwise show the list of all designs
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Production Workflow</h1>
              <p className="text-muted-foreground">Track your designs from concept to delivery</p>
            </div>
            <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={() => navigate('/new-design')}>
              <Plus className="w-4 h-4" />
              New Design
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Active</CardDescription>
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{activeDesigns}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Sampling</CardDescription>
                  <Package className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inSampling}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Review stage</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Production</CardDescription>
                  <Factory className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground">{inProduction}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Manufacturing</p>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-destructive/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs uppercase font-medium">Urgent</CardDescription>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                </div>
                <CardTitle className="text-3xl font-bold text-destructive">{awaitingApproval}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Action needed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Design Pipeline</CardTitle>
                    <CardDescription>Monitor and manage all designs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="on-track">On Track</TabsTrigger>
                    <TabsTrigger value="action-required">Urgent</TabsTrigger>
                    <TabsTrigger value="delayed">Delayed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="space-y-3">
                    {loading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p>Loading designs...</p>
                      </div>
                    ) : designs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No designs found</p>
                      </div>
                    ) : (
                      designs.map((design) => (
                        <Card 
                          key={design.id} 
                          className="border-border hover:border-primary/50 transition-all hover:shadow-sm cursor-pointer"
                          onClick={() => navigate({
                            pathname: '/workflow',
                            search: `?designId=${design.id}`
                          })}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground mb-2">{design.name}</h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {design.category || 'Uncategorized'}
                                </p>
                                <Badge variant="outline">{design.status || 'draft'}</Badge>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Action Items Sidebar */}
          <div>
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Action Items
                </CardTitle>
                <CardDescription>Tasks needing your attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">All caught up!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Workflow;
