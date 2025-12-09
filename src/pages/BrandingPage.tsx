import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { brandingService, BrandingSettings } from '../services/branding';
import { toast } from 'sonner';

export function BrandingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingSettings>({
    handle: '',
    brandName: '',
    primaryColor: '#D6FF00',
    heroImageUrl: '',
  });

  useEffect(() => {
    async function fetchBranding() {
      try {
        setIsLoading(true);
        const data = await brandingService.get();
        setBranding(data);
      } catch (error) {
        toast.error('Failed to load branding settings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBranding();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await brandingService.update({
        handle: branding.handle || undefined,
        brandName: branding.brandName || undefined,
        primaryColor: branding.primaryColor,
        heroImageUrl: branding.heroImageUrl || null,
      });
      setBranding(result);
      toast.success('Branding settings saved');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save branding settings';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const previewUrl = branding.handle
    ? `${window.location.origin.replace('dashboard', 'booking')}/${branding.handle}`
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-600">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="flex">
        {/* Sidebar */}
        <div
          className="bg-card border-r border-border flex-shrink-0"
          style={{ width: '220px', minHeight: '100vh', padding: '1rem 0' }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/event-types')}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            style={{ padding: '0.5rem 1rem', gap: '0.5rem', marginBottom: '1rem' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Navigation */}
          <nav>
            <Link
              to="/branding"
              className="block text-sm text-foreground font-medium"
              style={{
                padding: '0.5rem 1rem',
                borderLeft: '2px solid #18181b',
              }}
            >
              Branding
            </Link>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div
            className="bg-card border-b border-border"
            style={{ padding: '2rem 3rem' }}
          >
            <div className="flex items-start justify-between" style={{ maxWidth: '900px' }}>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Branding</h1>
                <p className="text-sm text-muted-foreground" style={{ marginTop: '0.25rem' }}>
                  Customize your public booking page appearance
                </p>
              </div>
              {previewUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '1.5rem 3rem', maxWidth: '900px' }}>
            <div className="flex flex-col gap-6">
              {/* Handle Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-4">Public URL</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="handle" className="text-sm font-medium">
                      Handle
                    </Label>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-muted-foreground mr-2">
                        booking.yourapp.com/
                      </span>
                      <Input
                        id="handle"
                        value={branding.handle || ''}
                        onChange={(e) =>
                          setBranding({ ...branding, handle: e.target.value.toLowerCase() })
                        }
                        placeholder="your-handle"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This is your unique URL for clients to book with you. Use lowercase letters, numbers, and hyphens.
                    </p>
                  </div>
                </div>
              </div>

              {/* Brand Identity Card */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-foreground mb-4">Brand Identity</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brandName" className="text-sm font-medium">
                      Brand Name
                    </Label>
                    <Input
                      id="brandName"
                      value={branding.brandName || ''}
                      onChange={(e) => setBranding({ ...branding, brandName: e.target.value })}
                      placeholder="Your Brand Name"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This name appears in the header of your booking page.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="primaryColor" className="text-sm font-medium">
                      Primary Color
                    </Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        id="primaryColorPicker"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        className="w-12 h-10 rounded border border-border cursor-pointer"
                      />
                      <Input
                        id="primaryColor"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                        placeholder="#D6FF00"
                        className="w-32"
                      />
                      <div
                        className="flex-1 h-10 rounded-lg"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your brand color used for buttons and accents. Must be a valid hex color.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="heroImageUrl" className="text-sm font-medium">
                      Hero Image URL
                    </Label>
                    <Input
                      id="heroImageUrl"
                      value={branding.heroImageUrl || ''}
                      onChange={(e) =>
                        setBranding({ ...branding, heroImageUrl: e.target.value || null })
                      }
                      placeholder="https://example.com/your-hero-image.jpg"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Optional. URL to an image that appears as the background on your landing page.
                    </p>
                    {branding.heroImageUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <img
                          src={branding.heroImageUrl}
                          alt="Hero preview"
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
