'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Settings, Edit, X } from 'lucide-react';
import Image from 'next/image';
import ImageEditor, { ImageSettings } from '@/components/admin/ImageEditor';

interface Page {
  value: string;
  label: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [availablePages, setAvailablePages] = useState<Page[]>([]);
  const [settings, setSettings] = useState({
    featuredProjectsLimit: 3,
    hero: {
      title: '',
      subtitle: '',
      primaryButton: {
        enabled: true,
        text: '',
        link: '',
        backgroundColor: '#ffffff',
        textColor: '#1e40af',
      },
      secondaryButton: {
        enabled: true,
        text: '',
        link: '',
        backgroundColor: 'transparent',
        textColor: '#ffffff',
      },
      backgroundImage: '',
      backgroundColor: '#1e40af',
      imageSettings: {
        opacity: 30,
        position: 'center' as 'center' | 'top' | 'bottom',
        scale: 100,
      },
    },
  });

  useEffect(() => {
    fetchSettings();
    fetchPages();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        // Merge with defaults to handle missing fields
        const mergedSettings = {
          featuredProjectsLimit: data.settings.featuredProjectsLimit || 3,
          hero: {
            title: data.settings.hero?.title || '',
            subtitle: data.settings.hero?.subtitle || '',
            primaryButton: {
              enabled: data.settings.hero?.primaryButton?.enabled ?? true,
              text: data.settings.hero?.primaryButton?.text || data.settings.hero?.primaryButtonText || 'View Our Projects',
              link: data.settings.hero?.primaryButton?.link || data.settings.hero?.primaryButtonLink || '/projects',
              backgroundColor: data.settings.hero?.primaryButton?.backgroundColor || '#ffffff',
              textColor: data.settings.hero?.primaryButton?.textColor || '#1e40af',
            },
            secondaryButton: {
              enabled: data.settings.hero?.secondaryButton?.enabled ?? true,
              text: data.settings.hero?.secondaryButton?.text || data.settings.hero?.secondaryButtonText || 'Get in Touch',
              link: data.settings.hero?.secondaryButton?.link || data.settings.hero?.secondaryButtonLink || '/contact',
              backgroundColor: data.settings.hero?.secondaryButton?.backgroundColor || 'transparent',
              textColor: data.settings.hero?.secondaryButton?.textColor || '#ffffff',
            },
            backgroundImage: data.settings.hero?.backgroundImage || '',
            backgroundColor: data.settings.hero?.backgroundColor || '#1e40af',
            imageSettings: {
              opacity: data.settings.hero?.imageSettings?.opacity ?? 30,
              position: data.settings.hero?.imageSettings?.position || 'center',
              scale: data.settings.hero?.imageSettings?.scale ?? 100,
            },
          },
        };
        
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      
      if (data.success) {
        setAvailablePages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleImageSave = (imageUrl: string, imageSettings: ImageSettings) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImage: imageUrl,
        imageSettings: {
          ...imageSettings,
          position: imageSettings.position as 'center' | 'top' | 'bottom',
        },
      },
    }));
    setShowImageEditor(false);
    toast.success('Hero background updated');
  };

  const removeHeroImage = () => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        backgroundImage: '',
      },
    }));
    toast.success('Hero background removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      console.log('Submitting settings:', settings);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully');
        // Refetch to confirm save
        await fetchSettings();
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getObjectPosition = () => {
    switch (settings.hero.imageSettings?.position) {
      case 'top':
        return 'object-top';
      case 'bottom':
        return 'object-bottom';
      default:
        return 'object-center';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Settings className="w-8 h-8 text-gray-600" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Configure homepage and site settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Hero Section Settings */}
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
            
            {/* Title */}
            <div className="mb-4">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input
                id="heroTitle"
                value={settings.hero.title}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  hero: { ...settings.hero, title: e.target.value }
                })}
                placeholder="Building the Future of..."
              />
            </div>

            {/* Subtitle */}
            <div className="mb-6">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={settings.hero.subtitle}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  hero: { ...settings.hero, subtitle: e.target.value }
                })}
                rows={3}
                placeholder="Expert precast concrete solutions..."
              />
            </div>

            {/* Primary Button */}
            <div className="border rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Primary Button</h3>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.hero.primaryButton.enabled}
                    onCheckedChange={(checked: boolean) => setSettings({
                      ...settings,
                      hero: {
                        ...settings.hero,
                        primaryButton: { ...settings.hero.primaryButton, enabled: checked }
                      }
                    })}
                  />
                  <Label>Enabled</Label>
                </div>
              </div>

              {settings.hero.primaryButton.enabled && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryButtonText">Button Text</Label>
                      <Input
                        id="primaryButtonText"
                        value={settings.hero.primaryButton.text}
                        onChange={(e) => setSettings({
                          ...settings,
                          hero: {
                            ...settings.hero,
                            primaryButton: { ...settings.hero.primaryButton, text: e.target.value }
                          }
                        })}
                        placeholder="View Our Projects"
                      />
                    </div>
                    <div>
                      <Label htmlFor="primaryButtonLink">Button Link</Label>
                      <select
                        id="primaryButtonLink"
                        value={settings.hero.primaryButton.link}
                        onChange={(e) => setSettings({
                          ...settings,
                          hero: {
                            ...settings.hero,
                            primaryButton: { ...settings.hero.primaryButton, link: e.target.value }
                          }
                        })}
                        className="w-full border rounded-md px-3 py-2"
                        title="Select page for primary button link"
                      >
                        {availablePages.map((page) => (
                          <option key={page.value} value={page.value}>
                            {page.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryButtonBg">Background Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={settings.hero.primaryButton.backgroundColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, backgroundColor: e.target.value }
                            }
                          })}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.hero.primaryButton.backgroundColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, backgroundColor: e.target.value }
                            }
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="primaryButtonTextColor">Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={settings.hero.primaryButton.textColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, textColor: e.target.value }
                            }
                          })}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.hero.primaryButton.textColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              primaryButton: { ...settings.hero.primaryButton, textColor: e.target.value }
                            }
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Secondary Button */}
            <div className="border rounded-lg p-4 mb-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Secondary Button</h3>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.hero.secondaryButton.enabled}
                    onCheckedChange={(checked: boolean) => setSettings({
                      ...settings,
                      hero: {
                        ...settings.hero,
                        secondaryButton: { ...settings.hero.secondaryButton, enabled: checked }
                      }
                    })}
                  />
                  <Label>Enabled</Label>
                </div>
              </div>

              {settings.hero.secondaryButton.enabled && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondaryButtonText">Button Text</Label>
                      <Input
                        id="secondaryButtonText"
                        value={settings.hero.secondaryButton.text}
                        onChange={(e) => setSettings({
                          ...settings,
                          hero: {
                            ...settings.hero,
                            secondaryButton: { ...settings.hero.secondaryButton, text: e.target.value }
                          }
                        })}
                        placeholder="Get in Touch"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryButtonLink">Button Link</Label>
                      <select
                        id="secondaryButtonLink"
                        value={settings.hero.secondaryButton.link}
                        onChange={(e) => setSettings({
                          ...settings,
                          hero: {
                            ...settings.hero,
                            secondaryButton: { ...settings.hero.secondaryButton, link: e.target.value }
                          }
                        })}
                        className="w-full border rounded-md px-3 py-2"
                        title="Select page for secondary button link"
                      >
                        {availablePages.map((page) => (
                          <option key={page.value} value={page.value}>
                            {page.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondaryButtonBg">Background Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={settings.hero.secondaryButton.backgroundColor === 'transparent' ? '#000000' : settings.hero.secondaryButton.backgroundColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, backgroundColor: e.target.value }
                            }
                          })}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.hero.secondaryButton.backgroundColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, backgroundColor: e.target.value }
                            }
                          })}
                          placeholder="transparent or #hex"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Use &quot;transparent&quot; for no background</p>
                    </div>
                    <div>
                      <Label htmlFor="secondaryButtonTextColor">Text Color</Label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="color"
                          value={settings.hero.secondaryButton.textColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, textColor: e.target.value }
                            }
                          })}
                          className="w-16 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={settings.hero.secondaryButton.textColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            hero: {
                              ...settings.hero,
                              secondaryButton: { ...settings.hero.secondaryButton, textColor: e.target.value }
                            }
                          })}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Background Color */}
            <div className="mb-6">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={settings.hero.backgroundColor}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    hero: { ...settings.hero, backgroundColor: e.target.value }
                  })}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={settings.hero.backgroundColor}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    hero: { ...settings.hero, backgroundColor: e.target.value }
                  })}
                  placeholder="#1e40af"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Choose the background color for the hero section
              </p>
            </div>

            {/* Background Image */}
            <div>
              <Label>Hero Background Image</Label>
              <div className="space-y-4">
                {settings.hero.backgroundImage && (
                  <div 
                    className="relative h-64 rounded-lg overflow-hidden border group"
                    style={{ backgroundColor: settings.hero.backgroundColor }}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{ opacity: (settings.hero.imageSettings?.opacity || 30) / 100 }}
                    >
                      <Image
                        src={settings.hero.backgroundImage}
                        alt="Hero background"
                        fill
                        className={`object-cover ${getObjectPosition()}`}
                        style={{
                          transform: `scale(${(settings.hero.imageSettings?.scale || 100) / 100})`,
                        }}
                      />
                    </div>
                    <div className="relative h-full flex items-center justify-center text-white">
                      <div className="text-center p-8">
                        <h3 className="text-2xl font-bold">Preview</h3>
                        <p className="text-sm">Opacity: {settings.hero.imageSettings?.opacity}% | Position: {settings.hero.imageSettings?.position} | Scale: {settings.hero.imageSettings?.scale}%</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeHeroImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove hero background image"
                      title="Remove hero background image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowImageEditor(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {settings.hero.backgroundImage ? 'Edit Background' : 'Add Background'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Upload and customize the hero background image
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Homepage Settings */}
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Homepage Settings</h2>
            
            <div>
              <Label htmlFor="featuredProjectsLimit">
                Number of Featured Projects to Display
              </Label>
              <Input
                id="featuredProjectsLimit"
                type="number"
                min="1"
                max="12"
                value={settings.featuredProjectsLimit}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  featuredProjectsLimit: parseInt(e.target.value) || 3 
                })}
              />
              <p className="text-sm text-gray-500 mt-1">
                How many featured projects to show in the carousel (1-12)
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>

      {/* Image Editor Modal */}
      {showImageEditor && (
        <ImageEditor
          currentImage={settings.hero.backgroundImage}
          onSave={handleImageSave}
          onCancel={() => setShowImageEditor(false)}
        />
      )}
    </div>
  );
}
