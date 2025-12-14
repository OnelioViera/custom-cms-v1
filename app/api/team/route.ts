import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

// GET all team members
export async function GET() {
  try {
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');
    
    const members = await teamCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      members: members.map(member => ({
        ...member,
        _id: member._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch team members'
    }, { status: 500 });
  }
}

// POST create new team member
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');

    // Check if slug already exists
    const existingMember = await teamCollection.findOne({ slug: body.slug });
    if (existingMember) {
      return NextResponse.json({
        success: false,
        message: 'A team member with this slug already exists'
      }, { status: 400 });
    }

    const newMember: TeamMember = {
      name: body.name,
      slug: body.slug,
      position: body.position,
      bio: body.bio || '',
      email: body.email,
      phone: body.phone,
      image: body.image,
      linkedIn: body.linkedIn,
      order: body.order || 0,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'admin'
    };

    const result = await teamCollection.insertOne(newMember);

    return NextResponse.json({
      success: true,
      message: 'Team member created successfully',
      member: {
        ...newMember,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create team member'
    }, { status: 500 });
  }
}
