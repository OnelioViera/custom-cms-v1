import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

// GET all projects
export async function GET() {
  try {
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');
    
    const projects = await projectsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        ...project,
        _id: project._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch projects'
    }, { status: 500 });
  }
}

// POST create new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');

    // Check if slug already exists
    const existingProject = await projectsCollection.findOne({ slug: body.slug });
    if (existingProject) {
      return NextResponse.json({
        success: false,
        message: 'A project with this slug already exists'
      }, { status: 400 });
    }

    const newProject: Project = {
      title: body.title,
      slug: body.slug,
      description: body.description || '',
      client: body.client,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      status: body.status || 'planning',
      featured: body.featured || false,
      images: body.images || [],
      content: body.content || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'admin'
    };

    const result = await projectsCollection.insertOne(newProject);

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: {
        ...newProject,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create project'
    }, { status: 500 });
  }
}
