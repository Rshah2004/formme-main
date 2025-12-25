import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StepHeader } from './StepHeader';
import { 
  Upload, 
  Camera,
  Clock,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';

interface SampleDevelopmentStageProps {
  order: any;
  onMarkSampleReady: (data: SampleData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface SampleData {
  photos: string[];
  notes: string;
  turnaroundDays: number;
}

export const SampleDevelopmentStage = ({
  order,
  onMarkSampleReady,
  isSubmitting = false
}: SampleDevelopmentStageProps) => {
  const [photos, setPhotos] = useState<string[]>(
    order.production_timeline_data?.sample_photos || []
  );
  const [notes, setNotes] = useState(order.production_timeline_data?.sample_notes || '');
  const [turnaroundDays, setTurnaroundDays] = useState(7);
  const [uploading, setUploading] = useState(false);

  const sampleType = order.production_timeline_data?.sample_type || 'Fit Sample';
  const isWaitingApproval = order.sample_submitted_at && order.sample_approved === null;
  const isApproved = order.sample_approved === true;
  const isRejected = order.sample_approved === false;

  const getStepStatus = () => {
    if (isApproved) return 'approved';
    if (isWaitingApproval) return 'awaiting_review';
    if (isRejected) return 'changes_requested';
    return 'in_progress';
  };

  const canSubmit = photos.length > 0;

  const handleSubmit = async () => {
    await onMarkSampleReady({
      photos,
      notes,
      turnaroundDays
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={3}
        stepTitle="Sample Development"
        owner="Manufacturer"
        requiredAction="Create sample and mark ready for review"
        status={getStepStatus()}
      />

      {/* Sample Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Sample Details</CardTitle>
            <Badge variant="outline">{sampleType}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Sample Type</Label>
              <p className="font-medium">{sampleType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Expected Turnaround</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={turnaroundDays}
                  onChange={(e) => setTurnaroundDays(parseInt(e.target.value) || 7)}
                  className="w-20 h-8"
                  disabled={isWaitingApproval || isApproved}
                />
                <span className="text-sm text-muted-foreground">days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      {isWaitingApproval && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Waiting for Designer Review
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Sample submitted on {new Date(order.sample_submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Sample Approved
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Proceed to Quality Check stage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Sample Photos</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload clear photos of the sample from multiple angles
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Photos */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="aspect-square relative rounded-lg overflow-hidden border bg-muted">
                  <img 
                    src={photo} 
                    alt={`Sample ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {!isWaitingApproval && !isApproved && (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG up to 10MB each
              </p>
              <Input
                type="file"
                className="hidden"
                id="sample-upload"
                multiple
                accept="image/*"
              />
              <Label htmlFor="sample-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <span>Select Files</span>
                </Button>
              </Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sample Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes about the sample, measurements, or any deviations from the tech pack..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            disabled={isWaitingApproval || isApproved}
          />
        </CardContent>
      </Card>

      {/* Action */}
      {!isWaitingApproval && !isApproved && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit || uploading}
            >
              <CheckCircle className="w-5 h-5" />
              Mark Sample Ready for Review
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Designer will be notified and cannot proceed until they review this sample.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
