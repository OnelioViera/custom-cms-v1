'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/admin/SearchInput';
import TableSkeleton from '@/components/admin/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/admin/Pagination';
import ExportImport from '@/components/admin/ExportImport';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Project {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  status: 'planning' | 'in-progress' | 'completed';
  featured: boolean;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Project deleted successfully');
        fetchProjects();
      } else {
        toast.error(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'planning':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProjects.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProjects.map(project => project._id?.toString() || '').filter(Boolean));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const projectsToDelete = projects.filter(p => selectedIds.includes(p._id?.toString() || ''));

    setBulkActionLoading(true);
    setBulkDeleteConfirm(false);

    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/projects/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedIds.length} project(s)`);
      setSelectedIds([]);
      fetchProjects();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some projects');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkFeature = async (featured: boolean) => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);

    try {
      const updatePromises = selectedIds.map(async (id) => {
        const project = projects.find(p => p._id?.toString() === id);
        if (!project) return;

        return fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...project, featured })
        });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully ${featured ? 'featured' : 'unfeatured'} ${selectedIds.length} project(s)`);
      setSelectedIds([]);
      fetchProjects();
    } catch (error) {
      console.error('Bulk feature error:', error);
      toast.error('Failed to update some projects');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkChangeStatus = async (newStatus: 'planning' | 'in-progress' | 'completed') => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);

    try {
      const updatePromises = selectedIds.map(async (id) => {
        const project = projects.find(p => p._id?.toString() === id);
        if (!project) return;

        return fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...project, status: newStatus })
        });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully updated status for ${selectedIds.length} project(s)`);
      setSelectedIds([]);
      fetchProjects();
    } catch (error) {
      console.error('Bulk status change error:', error);
      toast.error('Failed to update some projects');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.title.toLowerCase().includes(query) ||
      project.client?.toLowerCase().includes(query) ||
      (project as any).content?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  // Paginate filtered results
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-gray-600 mt-1">Manage your projects</p>
          </div>
        </div>
        <div className="mb-6 max-w-md">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your project portfolio</p>
        </div>
        <div className="flex gap-2">
          <ExportImport
            type="projects"
            apiEndpoint="/api/projects"
            requiredFields={['title', 'slug', 'description']}
            onImportComplete={fetchProjects}
          />
          <Button onClick={() => router.push('/admin/projects/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchInput
          placeholder="Search projects by title, client, or content..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-blue-900">
              {selectedIds.length} project{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => handleBulkFeature(true)}
              disabled={bulkActionLoading}
            >
              Feature Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkFeature(false)}
              disabled={bulkActionLoading}
            >
              Unfeature Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={bulkActionLoading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedProjects.length && paginatedProjects.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                    aria-label="Select all projects"
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No projects found matching your search.' : 'No projects yet. Create your first project!'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProjects.map((project) => (
                <TableRow key={project._id?.toString()}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(project._id?.toString() || '')}
                      onChange={() => handleSelectOne(project._id?.toString() || '')}
                      className="w-4 h-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${project.title}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell className="text-gray-600">{project.client || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.featured && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/projects/${project._id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(project._id?.toString() || '')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProjects.length}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={setBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} project(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {selectedIds.length} project(s). You can undo this action from the notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
