'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X, Trash2, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import TeamMemberPreview from '@/components/admin/TeamMemberPreview';

export default function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    role: '',
    bio: '',
    photo: '',
    email: '',
    phone: '',
    linkedin: '',
    order: 0,
    publishStatus: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    fetchTeamMember();
  }, []);

  const fetchTeamMember = async () => {
    try {
      const response = await fetch(`/api/team/${resolvedParams.id}`);
      const data = await response.json();

      if (data.success) {
        const member = data.member;
        setFormData({
          name: member.name,
          slug: member.slug,
          role: member.position || member.role || '',
          bio: member.bio || '',
          photo: member.image || member.photo || '',
          email: member.email || '',
          phone: member.phone || '',
          linkedin: member.linkedIn || member.linkedin || '',
          order: member.order || 0,
          publishStatus: member.publishStatus || 'draft',
        });
      } else {
        toast.error('Team member not found');
        router.push('/admin/team');
      }
    } catch (error) {
      console.error('Error fetching team member:', error);
      toast.error('Failed to load team member');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({
          ...prev,
          photo: data.url,
        }));
        toast.success('Photo uploaded successfully');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      photo: '',
    }));
    toast.success('Photo removed');
  };

  const handleSave = async (newPublishStatus?: 'draft' | 'published') => {
    setSaving(true);

    try {
      // Map form fields to API field names
      const saveData = {
        name: formData.name,
        slug: formData.slug,
        position: formData.role, // Map role to position
        bio: formData.bio,
        image: formData.photo, // Map photo to image
        email: formData.email,
        phone: formData.phone,
        linkedIn: formData.linkedin, // Map linkedin to linkedIn
        order: formData.order,
        publishStatus: newPublishStatus || formData.publishStatus,
      };

      const response = await fetch(`/api/team/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Team member ${newPublishStatus === 'published' ? 'published' : 'saved'} successfully`);
        setFormData({
          ...formData,
          publishStatus: newPublishStatus || formData.publishStatus,
        });
        if (newPublishStatus === 'published') {
          router.push('/admin/team');
        }
      } else {
        toast.error(data.message || 'Failed to update team member');
      }
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/team/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Team member deleted successfully');
        router.push('/admin/team');
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading team member...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div className="bg-white border-b sticky top-0 z-10 mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/team">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Edit Team Member</h1>
              <p className="text-sm text-gray-600">{formData.name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.publishStatus === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {formData.publishStatus === 'published' ? '● Published' : '● Draft'}
              </span>
            </div>

            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSave('draft')}
              disabled={saving}
            >
              <FileText className="w-4 h-4 mr-2" />
              Save as Draft
            </Button>
            
            <Button
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              <Eye className="w-4 h-4 mr-2" />
              {saving ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border space-y-6">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Role/Title *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                maxLength={300}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/300 characters
              </p>
            </div>

            {/* Photo */}
            <div>
              <Label>Photo</Label>
              <div className="space-y-4">
                {formData.photo && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border group">
                    <Image
                      src={formData.photo}
                      alt={formData.name}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : formData.photo ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    Professional headshot recommended (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* LinkedIn */}
            <div>
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            {/* Order */}
            <div>
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <TeamMemberPreview member={formData} />
        </div>
      </div>
    </div>
  );
}
