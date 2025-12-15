import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';
import { withCache, cache } from '@/lib/cache';
import { measureAsync } from '@/lib/monitoring/performance';
import { errorLogger } from '@/lib/monitoring/errors';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('includeAll') === 'true';

    const projects = await withCache(
      includeAll ? 'projects:all' : 'projects:published',
      async () => {
        return await measureAsync('api.projects.get', async () => {
          const db = await getDatabase();
          const projectsCollection = db.collection<Project>('projects');
          
          // Admin gets all statuses, public gets only in-progress and completed
          const statusFilter = includeAll 
            ? { status: { $in: ['planning' as const, 'in-progress' as const, 'completed' as const] } }
            : { status: { $in: ['in-progress' as const, 'completed' as const] } };
          
          return await projectsCollection
            .find(statusFilter)
            .sort({ createdAt: -1 })
            .toArray();
        });
      },
      config.get('CACHE_TTL_PROJECTS')
    );

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        _id: project._id?.toString()
      }))
    });
  } catch (error) {
    errorLogger.error('Failed to fetch projects', error as Error, {
      endpoint: '/api/projects',
      method: 'GET',
    });

    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await measureAsync('api.projects.create', async () => {
      const db = await getDatabase();
      const projectsCollection = db.collection<Project>('projects');

      // Check if slug already exists
      const existingProject = await projectsCollection.findOne({ slug: data.slug });
      if (existingProject) {
        throw new Error('A project with this slug already exists');
      }

      const project: Omit<Project, '_id'> = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await projectsCollection.insertOne(project as Project);
    });

    // Invalidate cache (both admin and public caches)
    cache.delete('projects:published');
    cache.delete('projects:all');

    errorLogger.info('Project created', {
      projectId: result.insertedId.toString(),
      endpoint: '/api/projects',
    });

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      id: result.insertedId.toString(),
    });
  } catch (error) {
    errorLogger.error('Failed to create project', error as Error, {
      endpoint: '/api/projects',
      method: 'POST',
    });

    // Handle slug conflict error
    if (error instanceof Error && error.message.includes('slug already exists')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    );
  }
}
