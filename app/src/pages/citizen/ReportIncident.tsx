import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, CheckCircle, AlertTriangle, Navigation, Loader2 } from 'lucide-react';
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
  { id: 1, title: 'Your Info', description: 'Name and contact' },
  { id: 2, title: 'Type', description: 'Select incident type' },
  { id: 3, title: 'Details', description: 'Describe the incident' },
  { id: 4, title: 'Location', description: 'Confirm location' },
  { id: 5, title: 'Media', description: 'Add photos (optional)' },
];

// Reverse geocoding function using Nominatim API
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'EmergencyReportingApp/1.0'
        }
      }
    );
    const data = await response.json();
    if (data.display_name) {
      return data.display_name;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

export default function ReportIncident() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citizenId] = useState(() => {
    // Generate citizen ID on component mount
    return globalThis.crypto?.randomUUID?.() ?? `citizen-${Date.now()}`;
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: '',
    description: '',
    location: '',
    media: [] as File[],
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { createIncident } = useStore();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation. Please enter location manually.',
        variant: 'destructive',
      });
      return;
    }

    setIsDetectingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(pos);
          setMapCenter(pos);
          
          // Reverse geocode to get address
          try {
            const address = await reverseGeocode(pos.lat, pos.lng);
            setFormData((prev) => ({ ...prev, location: address }));
            toast({
              title: 'Location detected',
              description: 'Your current location has been detected successfully.',
            });
          } catch (reverseError) {
            // If reverse geocoding fails, still use coordinates
            const coordStr = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`;
            setFormData((prev) => ({ ...prev, location: coordStr }));
            toast({
              title: 'Location detected',
              description: 'Coordinates detected. You can enter address manually or use coordinates.',
            });
          }
        } catch (error) {
          console.error('Error processing location:', error);
          toast({
            title: 'Location detection error',
            description: 'An error occurred while processing your location. Please try again or enter manually.',
            variant: 'destructive',
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        let errorMessage = 'Unable to detect your location. Please enter it manually.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please enter location manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again or enter location manually.';
            break;
          default:
            errorMessage = error.message || errorMessage;
            break;
        }
        
        toast({
          title: 'Location detection failed',
          description: errorMessage,
          variant: 'destructive',
        });
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 // Accept cached location up to 1 minute old
      }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const location = {
        lat: coords?.lat ?? 40.7128,
        lng: coords?.lng ?? -74.006,
        address: formData.location || 'Location not specified',
      };
      const title = formData.type ? `${formData.type} reported` : 'Incident reported';
      createIncident({
        type: formData.type || 'Other',
        title,
        description: formData.description,
        severity: 'medium',
        status: 'unverified',
        location,
        reportedBy: citizenId,
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
        return !!formData.name && !!formData.phone;
      case 2:
        return !!formData.type;
      case 3:
        return formData.description.length >= 10;
      case 4:
        return !!formData.location;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // Handle map position selection for reverse geocoding
  const handleMapPositionSelect = async (pos: { lat: number; lng: number }) => {
    setCoords(pos);
    setMapCenter(pos);
    try {
      const address = await reverseGeocode(pos.lat, pos.lng);
      setFormData((prev) => ({ ...prev, location: address }));
    } catch (error) {
      setFormData((prev) => ({ ...prev, location: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` }));
    }
  };

  return (
    <DashboardLayout role="citizen" userName={formData.name || "Citizen"}>
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
          {citizenId && (
            <p className="mt-2 text-xs text-muted-foreground">
              Citizen ID: <span className="font-mono">{citizenId}</span>
            </p>
          )}
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
                <Label htmlFor="name" className="text-base font-medium">
                  Your Name
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Please enter your full name for incident reporting.
                </p>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-12"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Enter your contact number for follow-up if needed.
                </p>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-12"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
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

          {currentStep === 3 && (
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

          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="location" className="text-base font-medium">
                  Incident Location
                </Label>
                <p className="mb-3 text-sm text-muted-foreground">
                  Detect your current location or enter it manually.
                </p>
                
                <div className="mb-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-2"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        Detect
                      </>
                    )}
                  </Button>
                  <div className="flex-1 text-sm text-muted-foreground flex items-center">
                    or enter location manually below
                  </div>
                </div>
                
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter location address or click on map"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="h-12 pl-10"
                  />
                </div>
              </div>
              
              {/* Map Picker (Leaflet) */}
              <div className="aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                <LeafletMap
                  key={mapCenter ? `${mapCenter.lat}-${mapCenter.lng}` : 'default'}
                  centerOnUser={!mapCenter}
                  incidents={[]}
                  selectableMarker
                  onSelectPosition={handleMapPositionSelect}
                  onUserLocation={(pos) => {
                    if (!coords && !mapCenter) {
                      setMapCenter(pos);
                      setCoords(pos);
                    }
                  }}
                  className="h-full w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Click on the map to set the incident location manually, or use the Detect button above
              </p>
            </div>
          )}

          {currentStep === 5 && (
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
            
            {currentStep < 5 ? (
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
