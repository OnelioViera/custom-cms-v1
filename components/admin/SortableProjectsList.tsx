'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface Project {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  status: string;
  featured: boolean;
  order: number;
  images?: string[];
  backgroundImage?: string;
  updatedAt: string;
}

interface SortableProjectsListProps {
  projects: Project[];
  onReorder: (projects: Project[]) => void;
}

function SortableProjectItem({ project }: { project: Project }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'planning':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const displayImage = project.backgroundImage || project.images?.[0];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Order Number */}
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
        {project.order}
      </div>

      {/* Project Image */}
      {displayImage ? (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <Image
            src={displayImage}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {project.title.substring(0, 2).toUpperCase()}
        </div>
      )}

      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">
            {project.title}
          </h3>
          {project.featured && (
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
          )}
        </div>
        {project.client && (
          <p className="text-sm text-gray-600 truncate">{project.client}</p>
        )}
      </div>

      {/* Status */}
      <Badge variant={getStatusColor(project.status)}>
        {project.status}
      </Badge>

      {/* Edit Button */}
      <Link href={`/admin/projects/${project._id}`}>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </Link>
    </div>
  );
}

export default function SortableProjectsList({ 
  projects: initialProjects, 
  onReorder 
}: SortableProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item._id === active.id);
        const newIndex = items.findIndex((item) => item._id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update order numbers
        const reorderedProjects = newOrder.map((project, index) => ({
          ...project,
          order: index + 1,
        }));

        onReorder(reorderedProjects);
        return reorderedProjects;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={projects.map(p => p._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {projects.map((project) => (
            <SortableProjectItem key={project._id} project={project} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
