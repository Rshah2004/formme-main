import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, DollarSign, Check, Factory as FactoryIcon, Star } from 'lucide-react';
import { useWorkflow } from '@/context/WorkflowContext';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { FactoryDocuments } from './FactoryDocuments';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { calculateMatchScore } from '@/utils/matchingAlgorithm';
import { useNavigate } from 'react-router-dom';

interface Design {
  id: string;
  name: string;
  category?: string;
}

interface Manufacturer {
  id: string;
  name: string;
  location: string | null;
  lead_time_days: number | null;
  price_range: string | null;
  specialties: string[] | null;
  certifications: string[] | null;
  categories: string[] | null;
  min_order_quantity: number | null;
  max_capacity: number | null;
  rating: number | null;
}

interface ManufacturerWithScore extends Manufacturer {
  matchScore: number;
}

interface FactoryMatchStageProps {
  design: Design;
}

const FactoryMatchStage = ({ design }: FactoryMatchStageProps) => {
  const { workflowData, updateWorkflowData, markStageComplete, setCurrentStage } = useWorkflow();
  const navigate = useNavigate();
  const [showFactories, setShowFactories] = useState(false);
  const [manufacturers, setManufacturers] = useState<ManufacturerWithScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [designCategory, setDesignCategory] = useState<string>('');
  const [selectedManufacturers, setSelectedManufacturers] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [alreadyRequestedIds, setAlreadyRequestedIds] = useState<Set<string>>(new Set());

  // Fetch design category and existing matches
  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch design category
      const { data: designData } = await supabase
        .from('designs')
        .select('category')
        .eq('id', design.id)
        .single();
      
      if (designData?.category) {
        setDesignCategory(designData.category);
      }

      // Fetch existing manufacturer matches for this design
      const { data: existingMatches } = await supabase
        .from('manufacturer_matches')
        .select('manufacturer_id')
        .eq('design_id', design.id);

      if (existingMatches) {
        const requestedIds = new Set(existingMatches.map(m => m.manufacturer_id));
        setAlreadyRequestedIds(requestedIds);
      }
    };

    fetchInitialData();
  }, [design.id]);

  console.log('what is design category', designCategory);

  const calculateAndSortManufacturers = (manufacturersList: Manufacturer[], applyFilters: boolean = true): ManufacturerWithScore[] => {
    console.log('[calculateAndSortManufacturers] Starting with manufacturers:', manufacturersList.length);
    console.log('[calculateAndSortManufacturers] Design category:', designCategory);
    console.log('[calculateAndSortManufacturers] Workflow data:', workflowData);
    
    let filtered = manufacturersList;
    
    // Only apply category filter (mandatory)
    if (designCategory && applyFilters && !viewAll) {
      console.log('[calculateAndSortManufacturers] Filtering by category:', designCategory);
      filtered = manufacturersList.filter(m => {
        const hasMatch = m.categories?.some((cat: string) => 
          cat.toLowerCase().includes(designCategory.toLowerCase()) ||
          designCategory.toLowerCase().includes(cat.toLowerCase())
        );
        console.log(`  ${m.name}: ${hasMatch ? 'PASS' : 'FAIL'} (categories: ${m.categories?.join(', ')})`);
        return hasMatch;
      });
      console.log('[calculateAndSortManufacturers] After category filter:', filtered.length, 'manufacturers');
    }

    // Calculate match scores for all manufacturers - scoring logic handles penalties
    const withScores = filtered.map(manufacturer => {
      const criteria = {
        quantity: parseInt(workflowData.quantity || '0'),
        leadTime: workflowData.leadTime || '4-6',
        location: workflowData.location || 'any',
        priceRange: workflowData.priceRange || 'mid',
        categories: designCategory ? [designCategory] : [],
        minPrice: workflowData.minPrice ? parseInt(workflowData.minPrice) : undefined,
        maxPrice: workflowData.maxPrice ? parseInt(workflowData.maxPrice) : undefined,
        applyStrictFilters: applyFilters && !viewAll
      };
      
      const profile = {
        moq: manufacturer.min_order_quantity || 0,
        maxCapacity: manufacturer.max_capacity || undefined,
        leadTime: manufacturer.lead_time_days || 30,
        location: manufacturer.location || '',
        priceTier: manufacturer.price_range || 'mid',
        rating: manufacturer.rating || undefined,
        categories: manufacturer.categories || []
      };
      
      const matchScore = calculateMatchScore(criteria, profile);
      console.log(`[calculateAndSortManufacturers] ${manufacturer.name}: Score ${matchScore}`);

      return { ...manufacturer, matchScore };
    });

    // Sort by match score descending
    const sorted = withScores.sort((a, b) => b.matchScore - a.matchScore);
    console.log('[calculateAndSortManufacturers] Final result:', sorted.length, 'manufacturers');
    
    return sorted;
  };

  const fetchFilteredManufacturers = async () => {
    try {
      setLoading(true);
      setShowFactories(true);
      
      // Fetch all active manufacturers
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Apply hard filters and calculate scores
      const manufacturersWithScores = calculateAndSortManufacturers(data || [], true);
      
      setManufacturers(manufacturersWithScores);
      setViewAll(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllManufacturers = async () => {
    try {
      setLoading(true);
      setShowFactories(true);
      
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      setViewAll(true);
      const manufacturersWithScores = calculateAndSortManufacturers(data || [], false);
      setManufacturers(manufacturersWithScores);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load manufacturers');
    } finally {
      setLoading(false);
    }
  };

  const handleFactorySelect = (factory: Manufacturer) => {
    // Don't allow selecting already-requested manufacturers
    if (alreadyRequestedIds.has(factory.id)) {
      toast.info('You have already sent a request to this manufacturer');
      return;
    }
    
    const newSelected = new Set(selectedManufacturers);
    if (newSelected.has(factory.id)) {
      newSelected.delete(factory.id);
    } else {
      newSelected.add(factory.id);
    }
    setSelectedManufacturers(newSelected);
  };

  const handleSendRequests = async () => {
    if (selectedManufacturers.size === 0) {
      toast.error('Please select at least one new manufacturer');
      return false;
    }

    setSending(true);
    try {
      // Use backend API for sending requests to manufacturers
      const result = await orderApi.sendToManufacturers({
        design_id: design.id,
        manufacturer_ids: Array.from(selectedManufacturers),
        quantity: parseInt(workflowData.quantity || '100'),
        notes: `Delivery date: ${workflowData.deliveryDate || 'TBD'}`
      });

      console.log('[handleSendRequests] Backend response:', result);

      toast.success(`Sent requests to ${selectedManufacturers.size} manufacturer(s)`);
      
      // Add the newly requested to the already requested set
      setAlreadyRequestedIds(prev => {
        const newSet = new Set(prev);
        selectedManufacturers.forEach(id => newSet.add(id));
        return newSet;
      });
      setSelectedManufacturers(new Set());
      
      // Mark stage complete and navigate directly to manufacture-selection (skip waiting page)
      markStageComplete('factory-match');
      markStageComplete('send-tech-pack');
      markStageComplete('waiting');
      setCurrentStage('manufacture-selection');
      
      return false; // Return false to prevent StageNavigation from also navigating
    } catch (error: any) {
      console.error('[handleSendRequests] Error sending requests:', error);
      toast.error(error.message || 'Failed to send requests');
      return false;
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <StageHeader
        icon={FactoryIcon}
        title="Find Your Manufacturing Partner"
        description="Select production quantity and preferences. We'll match you with the best factories for your needs."
        contextInfo={[
          { label: 'Design', value: 'Ready' },
          { label: 'Measurements', value: 'Complete' }
        ]}
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Requirements */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Production Requirements</h3>
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs mb-1.5 block">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={workflowData.quantity}
                      onChange={(e) => updateWorkflowData({ quantity: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Location</Label>
                    <Select
                      value={workflowData.location}
                      onValueChange={(value) => updateWorkflowData({ location: value })}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="europe">Europe</SelectItem>
                        <SelectItem value="asia">Asia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Min Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={workflowData.minPrice || ''}
                      onChange={(e) => updateWorkflowData({ minPrice: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Max Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={workflowData.maxPrice || ''}
                      onChange={(e) => updateWorkflowData({ maxPrice: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Find Match Button */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              onClick={fetchFilteredManufacturers}
              className="gap-2"
            >
              <FactoryIcon className="w-4 h-4" />
              Find Your Match!
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={fetchAllManufacturers}
              className="gap-2"
            >
              View All Manufacturers
            </Button>
          </div>

          {/* Factory Results */}
          {showFactories && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {viewAll ? 'All Manufacturers' : 'Matched Factories'}
              </h3>
              {loading ? (
                <p className="text-muted-foreground">Loading manufacturers...</p>
              ) : manufacturers.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-muted-foreground">
                    {viewAll 
                      ? 'No manufacturers exist in the database' 
                      : 'No such manufacturers exist matching your criteria. Try adjusting your filters or view all manufacturers.'}
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {manufacturers.map((factory) => {
                    const isSelected = selectedManufacturers.has(factory.id);
                    const isAlreadyRequested = alreadyRequestedIds.has(factory.id);
                    
                    return (
                      <Card
                        key={factory.id}
                        className={`border-2 transition-all cursor-pointer ${
                          isAlreadyRequested
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10'
                            : isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                        }`}
                        onClick={() => handleFactorySelect(factory)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{factory.name}</h4>
                                {factory.matchScore >= 80 && (
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                    Top Match
                                  </Badge>
                                )}
                                {isAlreadyRequested && (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                                    Request Sent
                                  </Badge>
                                )}
                                {isSelected && !isAlreadyRequested && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">Selected</Badge>
                                )}
                              </div>
                              <div className="flex gap-4 text-xs text-muted-foreground mb-3">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {factory.location || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {factory.lead_time_days || 'N/A'} days
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {factory.price_range || 'Varies'}
                                </span>
                                {factory.rating && (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {factory.rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                              {factory.specialties && factory.specialties.length > 0 && (
                                <div className="flex gap-2 text-xs">
                                  {factory.specialties.slice(0, 3).map((specialty, idx) => (
                                    <span key={idx} className="flex items-center gap-1">
                                      <Check className="w-3 h-3 text-primary" />
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{factory.matchScore}</div>
                              <div className="text-xs text-muted-foreground">Match Score</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {selectedManufacturers.size > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {selectedManufacturers.size} new manufacturer(s) selected. Click "Send Requests" to notify them about your order.
                </p>
              </CardContent>
            </Card>
          )}

          {alreadyRequestedIds.size > 0 && selectedManufacturers.size === 0 && (
            <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  You have already sent requests to {alreadyRequestedIds.size} manufacturer(s). Select new manufacturers to send additional requests.
                </p>
              </CardContent>
            </Card>
          )}

          <StageNavigation 
            onNext={handleSendRequests}
            nextLabel={sending ? 'Sending Requests...' : `Send Requests to ${selectedManufacturers.size || 0} New Manufacturer(s)`}
            showBack={true}
          />
        </div>

        <div className="space-y-4">
          <FactoryDocuments />
        </div>
      </div>
    </div>
  );
};

export default FactoryMatchStage;
