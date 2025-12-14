'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/admin/RichTextEditor';
import ImageUpload from '@/components/admin/ImageUpload';

export default function NewServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    icon: '',
    image: '',
    features: [] as string[],
    order: 0,
    status: 'active' as 'active' | 'inactive',
  });
  const [newFeature, setNewFeature] = useState('');

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Service created successfully');
        router.push('/admin/services');
      } else {
        toast.error(data.message || 'Failed to create service');
      }
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Ctrl+S to save
  const handleSaveShortcut = useCallback((e: KeyboardEvent) => {
    if (!loading) {
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }
    }
  }, [loading]);

  useKeyboardShortcut(
    { key: 's', ctrl: true, preventDefault: true },
    handleSaveShortcut,
    [loading]
  );

  // Keyboard shortcut: Escape to cancel
  useKeyboardShortcut(
    { key: 'Escape', preventDefault: false },
    () => {
      if (!loading) {
        router.push('/admin/services');
      }
    },
    [loading, router]
  );

  return (
    <div>
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/services')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
        <h1 className="text-3xl font-bold">Create New Service</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white rounded-lg border p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Precast Concrete Manufacturing"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/services/</span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="precast-concrete-manufacturing"
                required
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description *</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief overview for service cards..."
              rows={2}
              required
            />
            <p className="text-sm text-gray-500">
              Used in service listings and previews
            </p>
          </div>

          {/* Full Description */}
          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description</Label>
            <RichTextEditor
              content={formData.fullDescription}
              onChange={(fullDescription) => setFormData({ ...formData, fullDescription })}
              placeholder="Detailed service information..."
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Key Features</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFeature();
                  }
                }}
              />
              <Button type="button" onClick={addFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="space-y-2 mt-4">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <span className="flex-1">{feature}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Icon & Image */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Media</h3>
            
            <div className="space-y-2">
              <Label htmlFor="icon">Icon URL</Label>
              <Input
                id="icon"
                type="url"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="https://example.com/icons/service-icon.svg"
              />
              <p className="text-sm text-gray-500">
                Optional icon for service cards
              </p>
            </div>

            <ImageUpload
              value={formData.image}
              onChange={(image) => setFormData({ ...formData, image })}
              label="Hero Image"
              aspectRatio={16 / 9}
            />
          </div>

          {/* Order & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-sm text-gray-500">
                Lower numbers appear first
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'inactive') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'Create Service'}
              <span className="ml-2 text-xs opacity-60">Ctrl+S</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/services')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
