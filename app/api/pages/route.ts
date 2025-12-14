import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

// GET all pages
export async function GET() {
  try {
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const pages = await pagesCollection
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        ...page,
        _id: page._id?.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch pages'
    }, { status: 500 });
  }
}

// POST create new page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');

    // Check if slug already exists
    const existingPage = await pagesCollection.findOne({ slug: body.slug });
    if (existingPage) {
      return NextResponse.json({
        success: false,
        message: 'A page with this slug already exists'
      }, { status: 400 });
    }

    const newPage: Page = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      status: body.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'admin'
    };

    const result = await pagesCollection.insertOne(newPage);

    return NextResponse.json({
      success: true,
      message: 'Page created successfully',
      page: {
        ...newPage,
        _id: result.insertedId.toString()
      }
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create page'
    }, { status: 500 });
  }
}
