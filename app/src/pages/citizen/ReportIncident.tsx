import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { incidentTypes } from '@/data/mockData';
import { cn } from '@/lib/utils';
import LeafletMap from '@/components/map/LeafletMap';
import { useStore } from '@/lib/store';

const steps = [
  { id: 1, title: 'Type', description: 'Select incident type' },
  { id: 2, title: 'Details', description: 'Describe the incident' },
  { id: 3, title: 'Location', description: 'Confirm location' },
  { id: 4, title: 'Media', description: 'Add photos (optional)' },
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '123 Main Street, Downtown (Auto-detected)',
    media: [] as File[],
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { createIncident } = useStore();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      const location = {
        lat: coords?.lat ?? 40.7128,
        lng: coords?.lng ?? -74.006,
        address: formData.location,
      };
      const title = formData.type ? `${formData.type} reported` : 'Incident reported';
      createIncident({
        type: formData.type || 'Other',
        title,
        description: formData.description,
        severity: 'medium',
        status: 'unverified',
        location,
        reportedBy: 'citizen-1',
        mediaUrls: [],
        assignedTo: undefined,
      } as any);
      toast({
        title: 'Incident Reported Successfully',
        description: 'Your report has been submitted. Emergency responders have been notified.',
      });
      navigate('/citizen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, ...files].slice(0, 4),
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.type;
      case 2:
        return formData.description.length >= 10;
      case 3:
        return !!formData.location;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <DashboardLayout role="citizen" userName="John Smith">
      <div className="mx-auto max-w-2xl p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-critical">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-medium">Emergency Report</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Report an Incident</h1>
          <p className="mt-1 text-muted-foreground">
            Please provide as much detail as possible to help responders.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors',
                      currentStep > step.id
                        ? 'border-success bg-success text-success-foreground'
                        : currentStep === step.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 hidden text-center sm:block">
                    <p className={cn('text-sm font-medium', currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 w-8 flex-1 sm:w-16',
                      currentStep > step.id ? 'bg-success' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="rounded-xl border border-border bg-card p-6">
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="type" className="text-base font-medium">
                  What type of incident are you reporting?
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Select the category that best describes the emergency.
                </p>
                <Select value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
                  <SelectTrigger id="type" className="h-12">
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {incidentTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  Describe the incident
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Provide key details: what happened, how many people involved, any injuries?
                </p>
                <Textarea
                  id="description"
                  placeholder="Describe what you're seeing..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="min-h-[150px] resize-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {formData.description.length} / 500 characters
                </p>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  Incident Location
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  We've detected your location. Confirm or adjust if needed.
                </p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              
              {/* Map Picker (Leaflet) */}
              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                <LeafletMap
                  centerOnUser
                  incidents={[]}
                  selectableMarker
                  onSelectPosition={(pos) => setCoords(pos)}
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label className="text-base font-medium">
                  Add Photos or Videos (Optional)
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Visual evidence helps responders assess the situation faster.
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  {formData.media.map((file, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute right-2 top-2 rounded-full bg-foreground/80 p-1 text-background transition-colors hover:bg-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.media.length < 4 && (
                    <label className="flex aspect-video cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-muted">
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Upload media
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {4 - formData.media.length} remaining
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
              </Button>
            ) : (
              <Button
                variant="emergency"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
