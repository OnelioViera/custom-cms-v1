'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    featuredProjectsLimit: 3,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
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
      setSaving(false);
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

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
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
    </div>
  );
}
