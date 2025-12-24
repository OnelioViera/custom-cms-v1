import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { cache } from '@/lib/cache';

// GET all team members
export async function GET() {
  try {
    const cached = cache.get('team:all');
    if (cached) {
      return NextResponse.json(cached);
    }

    const db = await getDatabase();
    const teamCollection = db.collection('team');
    
    const members = await teamCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    const result = {
      success: true,
      members: members.map(m => ({
        ...m,
        _id: m._id?.toString()
      }))
    };

    cache.set('team:all', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST - Create new team member
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const db = await getDatabase();
    const teamCollection = db.collection('team');

    // Check if slug already exists
    const existingMember = await teamCollection.findOne({ slug: data.slug });
    if (existingMember) {
      return NextResponse.json({
        success: false,
        message: 'A team member with this slug already exists'
      }, { status: 400 });
    }

    const newMember = {
      name: data.name,
      slug: data.slug,
      position: data.position,
      bio: data.bio || '',
      image: data.image || '',
      email: data.email || '',
      phone: data.phone || '',
      linkedIn: data.linkedIn || '',
      order: data.order || 0,
      status: data.status || 'active',
      publishStatus: data.publishStatus || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await teamCollection.insertOne(newMember);

    cache.delete('team:all');
    cache.delete('team:published');

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      memberId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create team member' },
      { status: 500 }
    );
  }
}
