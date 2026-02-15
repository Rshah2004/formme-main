import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Package, 
  Ruler, 
  Palette, 
  Clock, 
  DollarSign, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MapPin,
  Download,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BrandDetailsSection } from '@/components/brand/BrandDetailsSection';

interface AcceptOrderStageProps {
  order: any;
  onAccept: () => void;
  onDecline: () => void;
  matchStatus: 'pending' | 'accepted' | 'rejected' | null;
}

export const AcceptOrderStage = ({ order, onAccept, onDecline, matchStatus }: AcceptOrderStageProps) => {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const designSpecs = order?.design_specs;
  const techPackData = order?.tech_pack_data;
  const techpack = order?.techpack;
  const design = order?.designs;
  const imageVariants = order?.image_variants || [];
  const printVariants = order?.print_variants || [];
  const measurements = Array.isArray(designSpecs?.measurements)
    ? designSpecs.measurements
    : designSpecs?.measurements
      ? Object.entries(designSpecs.measurements).map(([name, value]) => ({ name, value }))
      : [];
  const parseFabricType = (value: any): any[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [value];
      }
    }
    return [value];
  };
  const fabricEntries = parseFabricType(designSpecs?.fabric_type);
console.warn('quantity', order);
  // Get tech pack URL from multiple sources
  const techPackUrl = techpack?.pdf_url || design?.tech_pack_url || null;
  const designFiles: string[] = Array.isArray(design?.design_file_url)
    ? design.design_file_url
    : design?.design_file_url
      ? [design.design_file_url]
      : [];
  const thumbnailUrl = design?.thumbnail_url || null;

  const handleAccept = async () => {
    if (!order?.manufacturer_id) return;
    
    setAccepting(true);
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'accepted' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      toast.success('Order accepted! You can now review the tech pack and submit production parameters.');
      onAccept();
    } catch (error: any) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!order?.manufacturer_id) return;
    
    setDeclining(true);
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'rejected' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      toast.info('Order declined.');
      onDecline();
    } catch (error: any) {
      console.error('Error declining order:', error);
      toast.error('Failed to decline order. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  // If already accepted, show confirmation
  if (matchStatus === 'accepted') {
    return (
      <Card className="border-accent bg-accent/10">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-accent-foreground mb-2">
              Order Accepted
            </h3>
            <p className="text-muted-foreground max-w-md">
              You've accepted this order. Please proceed to "Review & Feasibility" to review the tech pack and submit your production parameters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If declined
  if (matchStatus === 'rejected') {
    return (
      <Card className="border-destructive/30 bg-destructive/10">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-destructive mb-2">
              Order Declined
            </h3>
            <p className="text-muted-foreground max-w-md">
              You've declined this order request.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Decision Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">
                New Order Request
              </p>
              <p className="text-sm text-muted-foreground">
                Review the order details below and decide if you want to take this project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Files & Tech Pack Section - Shown Before Agreeing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Design Files & Tech Pack
          </CardTitle>
          <CardDescription>
            Preview the design assets before agreeing to review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Design Thumbnail */}
          {thumbnailUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Design Preview</p>
              <div className="relative group w-fit">
                <img
                  src={thumbnailUrl}
                  alt="Design thumbnail"
                  className="max-w-[300px] max-h-[200px] object-contain rounded-lg border"
                />
                <a
                  href={thumbnailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                >
                  <ExternalLink className="w-6 h-6 text-white" />
                </a>
              </div>
            </div>
          )}

          {/* Tech Pack Download */}
          {techPackUrl ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Tech Pack</p>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Tech Pack PDF</p>
                  <p className="text-xs text-muted-foreground">
                    {techpack?.version ? `Version ${techpack.version}` : 'Latest version'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={techPackUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={techPackUrl} download>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-lg border border-dashed text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tech pack uploaded yet</p>
            </div>
          )}

          {/* Design Files */}
          {designFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Design Files</p>
              <div className="space-y-2">
                {designFiles.map((url, idx) => {
                  const name = url.split('/').pop() || `design-file-${idx + 1}`;
                  return (
                    <div key={`${url}-${idx}`} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                      <ImageIcon className="w-8 h-8 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">Designer uploaded file</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={url} download>
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Color & Size Variants */}
<Card>
  <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Design Variants
              </CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Thumbnail */}
    {/* Tech Pack */}
    {/* Design File */}
    <div>
      <h2 className="font-medium mb-3 flex items-center gap-2">
        Color and size Variants
      </h2>

      {/* Color & Size Variants */}
      {imageVariants.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageVariants.map((variant: any) => (
                  <div
                      key={variant.id}
                      className="border rounded-lg p-3 space-y-2 bg-muted/30"
                  >
                    {variant.image_url ? (
                        <img
                            src={variant.image_url}
                            alt="Variant"
                            className="w-full h-32 object-contain rounded-md border"
                        />
                    ) : (
                        <div
                            className="h-32 flex items-center justify-center border rounded-md text-muted-foreground text-sm">
                          No image uploaded
                        </div>
                    )}

                    <div className="text-sm space-y-1">
                      {variant.color && (
                          <div>
                            <span className="text-muted-foreground">Color:</span>{' '}
                            <span className="font-medium">{variant.color}</span>
                          </div>
                      )}
                      {variant.size && (
                          <div>
                            <span className="text-muted-foreground">Size:</span>{' '}
                            <span className="font-medium">{variant.size}</span>
                          </div>
                      )}
                      {variant.quantity && (
                          <div>
                            <span className="text-muted-foreground">Qty:</span>{' '}
                            <span className="font-medium">{variant.quantity}</span>
                          </div>
                      )}
                    </div>

                    {variant.image_url && (
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <a href={variant.image_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1"/>
                            View
                          </a>
                        </Button>
                    )}
                  </div>
              ))}
            </div>
          </div>
      )}
    </div>
      <Separator/>
      <div>
        <h2 className="font-medium mb-3 flex items-center gap-2">
          Print & Artwork
        </h2>
        {/* Print Variants (you should add this too) */}
        {printVariants.length > 0 && (
            <div className="space-y-2">

              <div className="space-y-3">
                {printVariants.map((print: any) => (
                    <div
                        key={print.id}
                        className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30"
                    >
                      <ImageIcon className="w-8 h-8 text-primary"/>

                      <div className="flex-1">
                        <p className="text-sm font-medium">{print.print_type}</p>
                        {print.notes && (
                            <p className="text-xs text-muted-foreground">{print.notes}</p>
                        )}
                      </div>

                      {print.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={print.file_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-1"/>
                              View
                            </a>
                          </Button>
                      )}
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  </CardContent>
</Card>


      {/* Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5"/>
            Order Overview
          </CardTitle>
          <CardDescription>
            Review the design and production requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Design Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Design Name</p>
              <p className="font-medium">{design?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ca tegory</p>
              <p className="font-medium">{design?.category || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" /> Designer
              </p>
              <p className="font-medium">{order?.profiles?.full_name || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Quantity</p>
             <p className="font-medium">{(order as any)?.quantity || 'TBD'} units</p>
            </div>
           <div className="space-y-1">
             <p className="text-sm text-muted-foreground">Sample Type Preference</p>
             <p className="font-medium capitalize">
               {order?.production_timeline_data?.sample_type_preference ||
                order?.designs?.sample_type_preference ||
                'Not specified'}
             </p>
           </div>
          </div>

          <Separator />

          <BrandDetailsSection profile={order?.profiles} />

          <Separator />

          {/* Budget & Timeline */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget & Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="font-semibold text-lg">
                  {order?.budget_min && order?.budget_max 
                    ? `$${order.budget_min} - $${order.budget_max}`
                    : 'Not specified'}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="font-semibold text-lg">
                  {order?.lead_time_days ? `${order.lead_time_days} days` : 'Flexible'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Design Specifications */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Design Specifications
            </h4>
            {designSpecs ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fabric Type</p>
                    {fabricEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {fabricEntries.map((fabric: any, idx: number) => {
                          const label = typeof fabric === 'string'
                            ? fabric
                            : [fabric.type, fabric.fiberPercent ? `${fabric.fiberPercent}%` : null]
                                .filter(Boolean)
                                .join(' ');
                          return (
                            <Badge key={`${label}-${idx}`} variant="secondary">
                              {label || 'Fabric'}
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <Badge variant="secondary">Not specified</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GSM</p>
                    <Badge variant="secondary">{designSpecs.gsm || 'Not specified'}</Badge>
                  </div>
                  {measurements.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Measurements</p>
                      <Badge variant="secondary">{measurements.length} items</Badge>
                    </div>
                  )}
                </div>
                {measurements.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {measurements.map((m: any, idx: number) => (
                      <div key={`${m.name || m.label || 'measurement'}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                        <span className="text-muted-foreground truncate">
                          {m.name || m.label || 'Measurement'}
                        </span>
                        <span className="font-medium">
                          {m.value ?? m.measurement ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {designSpecs.construction_notes && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Construction Notes</p>
                    <p className="text-sm">{designSpecs.construction_notes}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No specifications provided yet.</p>
            )}
          </div>

          {/* Location Preference */}
          {order?.preferred_location && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Preference
                </h4>
                <Badge variant="outline">{order.preferred_location}</Badge>
              </div>
            </>
          )}

          {/* Sustainability */}
          {order?.sustainability_priority && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Sustainability Priority
                </h4>
                <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/30">
                  {order.sustainability_priority}
                </Badge>
              </div>
            </>
          )}

          {/* Notes */}
          {order?.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Additional Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Decision Buttons */}
      <Card>
        <CardContent className="py-6">
          <h3 className="text-xl font-bold mb-2">Tech Pack Review Request</h3>
          <p className="text-muted-foreground mb-4">
            The designer has requested you to review their tech pack. Agreeing to review does not commit you to production.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={handleAccept}
              disabled={accepting || declining}
              className="gap-2"
            >
              <Clock className="w-4 h-4" />
              {accepting ? 'Accepting...' : 'Agree to Review Tech Pack'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDecline}
              disabled={declining || accepting}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              {declining ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
