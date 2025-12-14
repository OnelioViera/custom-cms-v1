'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    },
    seo: {
      defaultMetaTitle: '',
      defaultMetaDescription: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setFormData({
          siteName: data.settings.siteName || '',
          siteDescription: data.settings.siteDescription || '',
          logo: data.settings.logo || '',
          favicon: data.settings.favicon || '',
          primaryColor: data.settings.primaryColor || '#3b82f6',
          secondaryColor: data.settings.secondaryColor || '#1e40af',
          contactEmail: data.settings.contactEmail || '',
          contactPhone: data.settings.contactPhone || '',
          address: data.settings.address || '',
          socialMedia: {
            facebook: data.settings.socialMedia?.facebook || '',
            twitter: data.settings.socialMedia?.twitter || '',
            linkedin: data.settings.socialMedia?.linkedin || '',
            instagram: data.settings.socialMedia?.instagram || ''
          },
          seo: {
            defaultMetaTitle: data.settings.seo?.defaultMetaTitle || '',
            defaultMetaDescription: data.settings.seo?.defaultMetaDescription || ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-gray-600 mt-1">Manage your website configuration</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-semibold">General Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                placeholder="Lindsay Precast"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
                placeholder="Brief description of your company..."
                rows={3}
              />
            </div>

            <ImageUpload
              value={formData.logo}
              onChange={(logo) => setFormData({ ...formData, logo })}
              label="Logo"
              aspectRatio={0}
            />

            <ImageUpload
              value={formData.favicon}
              onChange={(favicon) => setFormData({ ...formData, favicon })}
              label="Favicon"
            />
          </div>

          {/* Brand Colors */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Brand Colors</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="info@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State 12345"
                rows={3}
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-semibold">Social Media</h2>
            
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                })}
                placeholder="https://facebook.com/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                type="url"
                value={formData.socialMedia.twitter}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                })}
                placeholder="https://twitter.com/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                })}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                })}
                placeholder="https://instagram.com/yourcompany"
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            <h2 className="text-xl font-semibold">SEO Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="defaultMetaTitle">Default Meta Title</Label>
              <Input
                id="defaultMetaTitle"
                value={formData.seo.defaultMetaTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  seo: { ...formData.seo, defaultMetaTitle: e.target.value }
                })}
                placeholder="Default page title for SEO"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
              <Textarea
                id="defaultMetaDescription"
                value={formData.seo.defaultMetaDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  seo: { ...formData.seo, defaultMetaDescription: e.target.value }
                })}
                placeholder="Default meta description for SEO"
                rows={3}
              />
              <p className="text-sm text-gray-500">
                {formData.seo.defaultMetaDescription.length}/160 characters
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6">
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
