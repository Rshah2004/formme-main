import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info, Package, DollarSign, Clock, MapPin, User, FileText, Ruler, Palette, Image } from 'lucide-react';

interface OrderInfoDrawerProps {
  order: any;
  trigger?: React.ReactNode;
}

export const OrderInfoDrawer = ({ order, trigger }: OrderInfoDrawerProps) => {
  const design = order?.designs;
  const designSpecs = order?.design_specs;
  const techpack = order?.techpack;

  const sampleType = order?.production_timeline_data?.sample_type_preference || 'Not specified';
  const designFiles = order?.production_timeline_data?.design_files || [];
  const quantity = order?.quantity || 'Not specified';

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg">
            <Info className="w-5 h-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Design Info */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Design Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Design Name</span>
                <span className="font-medium">{design?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{design?.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{quantity} units</span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Sample Preference */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Sample Requirements
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sample Type</span>
                <Badge variant="outline">{sampleType}</Badge>
              </div>
            </div>
          </section>

          <Separator />

          {/* Budget & Timeline */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget & Timeline
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget Range</span>
                <span className="font-medium">
                  {order?.budget_min && order?.budget_max
                    ? `$${order.budget_min} - $${order.budget_max}`
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lead Time</span>
                <span className="font-medium">
                  {order?.lead_time_days ? `${order.lead_time_days} days` : 'Flexible'}
                </span>
              </div>
              {order?.production_start_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Production Start</span>
                  <span className="font-medium">{new Date(order.production_start_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Design Specifications */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Specifications
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fabric Type</span>
                <span className="font-medium">{designSpecs?.fabric_type || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GSM</span>
                <span className="font-medium">{designSpecs?.gsm || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Print Type</span>
                <span className="font-medium">{designSpecs?.print_type || 'None'}</span>
              </div>
            </div>
            {designSpecs?.construction_notes && (
              <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                <p className="text-muted-foreground text-xs mb-1">Construction Notes</p>
                <p>{designSpecs.construction_notes}</p>
              </div>
            )}
          </section>

          <Separator />

          {/* Designer Info */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Designer Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{order?.profiles?.full_name || 'Unknown'}</span>
              </div>
              {order?.preferred_location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preferred Location</span>
                  <span className="font-medium">{order.preferred_location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Design Files */}
          {designFiles.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Design Files
                </h3>
                <div className="space-y-2">
                  {designFiles.map((file: any, idx: number) => (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                    >
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm truncate flex-1">{file.name}</span>
                    </a>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Tech Pack Link */}
          {techpack?.pdf_url && (
            <>
              <Separator />
              <section>
                <a
                  href={techpack.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">View Tech Pack</p>
                    <p className="text-xs text-muted-foreground">PDF Document</p>
                  </div>
                </a>
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
