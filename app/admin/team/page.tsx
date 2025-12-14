'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/components/admin/SearchInput';
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

  useEffect(() => {
    fetchMembers();
  }, []);

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

      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No team members found matching your search.' : 'No team members yet. Add your first team member!'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                <TableRow key={member._id?.toString()}>
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
        )}
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
