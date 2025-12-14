import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';
import { ObjectId } from 'mongodb';

// GET all services
export async function GET() {
  try {
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');
    
    const services = await servicesCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      services: services.map(service => ({
        ...service,
        _id: service._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch services'
    }, { status: 500 });
  }
}

// POST create new service
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');

    // Check if slug already exists
    const existingService = await servicesCollection.findOne({ slug: body.slug });
    if (existingService) {
      return NextResponse.json({
        success: false,
        message: 'A service with this slug already exists'
      }, { status: 400 });
    }

    const newService: Service = {
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription || '',
      fullDescription: body.fullDescription || '',
      icon: body.icon,
      image: body.image,
      features: body.features || [],
      order: body.order || 0,
      status: body.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'admin'
    };

    const result = await servicesCollection.insertOne(newService);

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      service: {
        ...newService,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create service'
    }, { status: 500 });
  }
}
