import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { getDatabase } from '@/lib/mongodb';
import { Service } from '@/lib/models/Content';

async function getService(slug: string) {
  try {
    const db = await getDatabase();
    const servicesCollection = db.collection<Service>('services');
    
    const service = await servicesCollection.findOne({ slug, status: 'active' });

    if (!service) return null;

    return {
      ...service,
      _id: service._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching service:', error);
    return null;
  }
}

export default async function ServiceDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/services">
            <Button variant="ghost" className="text-white hover:text-blue-100 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </Button>
          </Link>
          <h1 className="text-5xl font-bold mb-4">{service.title}</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            {service.shortDescription}
          </p>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-8">
                {service.fullDescription && (
                  <div className="prose max-w-none mb-8">
                    <div 
                      className="text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: service.fullDescription }}
                    />
                  </div>
                )}

                {service.features && service.features.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6">
                  Contact us to discuss your project requirements and get a custom quote.
                </p>
                <Link href="/contact">
                  <Button className="w-full" size="lg">
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
