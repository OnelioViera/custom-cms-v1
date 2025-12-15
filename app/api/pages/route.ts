import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';
import { measureAsync } from '@/lib/monitoring/performance';
import { errorLogger } from '@/lib/monitoring/errors';
import { withCache, cache } from '@/lib/cache';
import { config } from '@/lib/config';

export async function GET() {
  try {
    const pages = await withCache(
      'pages:published',
      async () => {
        return await measureAsync('api.pages.get', async () => {
          const db = await getDatabase();
          const pagesCollection = db.collection<Page>('pages');
          return await pagesCollection
            .find({ status: 'published' })
            .sort({ createdAt: -1 })
            .toArray();
        });
      },
      config.get('CACHE_TTL_PAGES')
    );

    return NextResponse.json({
      success: true,
      pages: pages.map(page => ({
        ...page,
        _id: page._id?.toString()
      }))
    });
  } catch (error) {
    errorLogger.error('Failed to fetch pages', error as Error, {
      endpoint: '/api/pages',
      method: 'GET',
    });
    
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await measureAsync('api.pages.create', async () => {
      const db = await getDatabase();
      const pagesCollection = db.collection<Page>('pages');

      const page: Omit<Page, '_id'> = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return await pagesCollection.insertOne(page as Page);
    });

    // Invalidate cache
    cache.delete('pages:published');

    errorLogger.info('Page created', {
      pageId: result.insertedId.toString(),
      endpoint: '/api/pages',
    });

    return NextResponse.json({
      success: true,
      message: 'Page created successfully',
      id: result.insertedId.toString(),
    });
  } catch (error) {
    errorLogger.error('Failed to create page', error as Error, {
      endpoint: '/api/pages',
      method: 'POST',
    });

    console.error('Error creating page:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create page' },
      { status: 500 }
    );
  }
}
