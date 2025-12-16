import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDatabase } from '@/lib/mongodb';
import { Project, Service } from '@/lib/models/Content';
import FeaturedProjectsCarousel from '@/components/public/FeaturedProjectsCarousel';

async function getHomeData() {
  try {
    const db = await getDatabase();
    
    // Get settings
    const settingsCollection = db.collection('settings');
    const settings = await settingsCollection.findOne({ _id: 'site-settings' as any });
    const limit = settings?.featuredProjectsLimit || 3;
    
    // Get featured projects
    const projectsCollection = db.collection<Project>('projects');
    const featuredProjects = await projectsCollection
      .find({ 
        featured: true, 
        status: { $in: ['in-progress' as const, 'completed' as const] }
      })
      .sort({ order: 1, updatedAt: -1 })
      .limit(limit)
      .toArray();

    console.log('Featured projects found:', featuredProjects.length);
    console.log('Featured projects data:', JSON.stringify(featuredProjects, null, 2));
    
    // Get active services
    const servicesCollection = db.collection<Service>('services');
    const services = await servicesCollection
      .find({ status: 'active' })
      .sort({ order: 1 })
      .limit(6)
      .toArray();

    const mappedProjects = featuredProjects.map(p => {
      const mapped = {
        _id: p._id?.toString() || '',
        title: p.title,
        slug: p.slug,
        description: p.description || '',
        client: p.client,
        status: p.status,
        featured: p.featured,
        images: Array.isArray(p.images) ? p.images : [],
        backgroundImage: p.backgroundImage || '',
      };
      console.log('Mapped project:', mapped.title, 'Images:', mapped.images, 'BG:', mapped.backgroundImage);
      return mapped;
    });

    return {
      projects: mappedProjects,
      services: services.map(s => ({
        ...s,
        _id: s._id?.toString()
      }))
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return { projects: [], services: [] };
  }
}

export default async function HomePage() {
  const { projects, services } = await getHomeData();
  
  console.log('HomePage - Projects received:', projects.length);
  projects.forEach(p => {
    console.log(`Project: ${p.title}, Images: ${p.images?.length || 0}, BG: ${p.backgroundImage ? 'Yes' : 'No'}`);
  });

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Building the Future of Renewable Energy Infrastructure
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Expert precast concrete solutions for utility-scale battery storage, 
              solar installations, and critical infrastructure projects.
            </p>
            <div className="flex gap-4">
              <Link href="/projects">
                <Button size="lg" variant="default" className="bg-white text-blue-900 hover:bg-blue-50">
                  View Our Projects
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-800">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
              <p className="text-xl text-gray-600">
                Comprehensive precast solutions for renewable energy projects
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.shortDescription}
                  </p>
                  <Link href={`/services/${service.slug}`} className="text-blue-600 font-medium hover:text-blue-700">
                    Learn more →
                  </Link>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/services">
                <Button variant="outline" size="lg">
                  View All Services
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects Carousel */}
      {projects.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h2>
              <p className="text-xl text-gray-600">
                Powering the renewable energy revolution
              </p>
            </div>
            
            <FeaturedProjectsCarousel projects={projects} />

            <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="default" size="lg">
                  View All Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Partner with Lindsay Precast for reliable, high-quality precast solutions 
            for your renewable energy infrastructure.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="default" className="bg-white text-blue-900 hover:bg-blue-50">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
