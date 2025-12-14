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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/admin/Pagination';

interface TeamMember {
  _id: string;
  name: string;
  position: string;
  email?: string;
  status: 'active' | 'inactive';
  order: number;
  updatedAt: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: string) => {
    setMemberToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;

    try {
      const response = await fetch(`/api/team/${memberToDelete}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Team member deleted successfully');
        fetchMembers();
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  // Filter team members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;

    const query = searchQuery.toLowerCase();
    return members.filter(member => 
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query) ||
      member.email?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Paginate filtered results
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedMembers.map(member => member._id?.toString() || '').filter(Boolean));
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
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} team member(s)?`)) {
      return;
    }

    setBulkActionLoading(true);

    try {
      const deletePromises = selectedIds.map(id =>
        fetch(`/api/team/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedIds.length} team member(s)`);
      setSelectedIds([]);
      fetchMembers();
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete some team members');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (selectedIds.length === 0) return;

    setBulkActionLoading(true);

    try {
      const updatePromises = selectedIds.map(async (id) => {
        const member = members.find(m => m._id?.toString() === id);
        if (!member) return;

        return fetch(`/api/team/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...member, status })
        });
      });

      await Promise.all(updatePromises);
      
      toast.success(`Successfully set ${selectedIds.length} member(s) to ${status}`);
      setSelectedIds([]);
      fetchMembers();
    } catch (error) {
      console.error('Bulk status error:', error);
      toast.error('Failed to update some team members');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-gray-600 mt-1">Manage your team</p>
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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team directory</p>
        </div>
        <Button onClick={() => router.push('/admin/team/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Team Member
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <SearchInput
          placeholder="Search team members by name, position, or email..."
          onSearch={setSearchQuery}
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-blue-900">
              {selectedIds.length} team member{selectedIds.length !== 1 ? 's' : ''} selected
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
              onClick={() => handleBulkStatus('active')}
              disabled={bulkActionLoading}
            >
              Activate Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatus('inactive')}
              disabled={bulkActionLoading}
            >
              Deactivate Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
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
                    checked={selectedIds.length === paginatedMembers.length && paginatedMembers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No team members found matching your search.' : 'No team members yet. Add your first team member!'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMembers.map((member) => (
                <TableRow key={member._id?.toString()}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(member._id || '')}
                      onChange={() => handleSelectOne(member._id || '')}
                      className="w-4 h-4 rounded border-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-gray-600">{member.position}</TableCell>
                  <TableCell className="text-gray-600">{member.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/team/${member._id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(member._id?.toString() || '')}
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
          totalItems={filteredMembers.length}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
