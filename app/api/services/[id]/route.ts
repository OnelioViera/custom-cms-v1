import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

// GET single service
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');
    
    const service = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!service) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      service: {
        ...service,
        _id: service._id?.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch service'
    }, { status: 500 });
  }
}

// PUT update service
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');

    const updateData = {
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      icon: body.icon,
      image: body.image,
      features: body.features,
      order: body.order,
      status: body.status,
      updatedAt: new Date()
    };

    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update service'
    }, { status: 500 });
  }
}

// DELETE service
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');

    const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Service not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete service'
    }, { status: 500 });
  }
}
