import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

// GET single team member
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');
    
    const member = await teamCollection.findOne({ _id: new ObjectId(id) });

    if (!member) {
      return NextResponse.json({
        success: false,
        message: 'Team member not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      member: {
        ...member,
        _id: member._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch team member'
    }, { status: 500 });
  }
}

// PUT update team member
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');

    const updateData = {
      name: body.name,
      slug: body.slug,
      position: body.position,
      bio: body.bio,
      email: body.email,
      phone: body.phone,
      image: body.image,
      linkedIn: body.linkedIn,
      order: body.order,
      status: body.status,
      updatedAt: new Date()
    };

    const result = await teamCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Team member not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully'
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update team member'
    }, { status: 500 });
  }
}

// DELETE team member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');

    const result = await teamCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Team member not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete team member'
    }, { status: 500 });
  }
}
