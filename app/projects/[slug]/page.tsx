import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';

async function getProject(slug: string) {
  try {
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');
    
    const project = await projectsCollection.findOne({ slug });

    if (!project) return null;

    return {
      ...project,
      _id: project._id?.toString()
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function ProjectDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/projects">
            <Button variant="ghost" className="text-white hover:text-blue-100 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="bg-blue-700">
              {project.status === 'in-progress' ? 'In Progress' : 'Completed'}
            </Badge>
            {project.featured && (
              <Badge variant="outline" className="border-white text-white">
                Featured
              </Badge>
            )}
          </div>
          <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
          {project.client && (
            <p className="text-xl text-blue-100">Client: {project.client}</p>
          )}
        </div>
      </section>

      {/* Project Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Project Info */}
            <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
              {project.startDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Project Timeline</h3>
                    <p className="text-gray-600">
                      {new Date(project.startDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}`}
                    </p>
                  </div>
                </div>
              )}
              {project.client && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Client</h3>
                    <p className="text-gray-600">{project.client}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {/* Full Content */}
            {project.content && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Details</h2>
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: project.content }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Have a Project in Mind?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can help bring your renewable energy infrastructure to life.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="default" className="bg-white text-blue-900 hover:bg-blue-50">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
