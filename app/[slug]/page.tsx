import { notFound } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Page } from '@/lib/models/Content';

async function getPage(slug: string) {
  try {
    const db = await getDatabase();
    const pagesCollection = db.collection<Page>('pages');
    
    const page = await pagesCollection.findOne({ 
      slug, 
      status: 'published' 
    });

    if (!page) return null;

    return {
      ...page,
      _id: page._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found'
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.content.substring(0, 160)
  };
}

export default async function DynamicPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold">{page.title}</h1>
        </div>
      </section>

      {/* Page Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
