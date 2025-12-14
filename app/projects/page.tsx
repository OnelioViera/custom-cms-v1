import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getDatabase } from '@/lib/mongodb';
import { Project } from '@/lib/models/Content';

async function getProjects() {
  try {
    const db = await getDatabase();
    const projectsCollection = db.collection<Project>('projects');
    
    const projects = await projectsCollection
      .find({ status: { $in: ['completed', 'in-progress'] } })
      .sort({ createdAt: -1 })
      .toArray();

    return projects.map(p => ({
      ...p,
      _id: p._id?.toString()
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Our Projects</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Powering the renewable energy revolution with innovative precast concrete solutions
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No projects available at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <Link 
                  key={project._id} 
                  href={`/projects/${project.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    {project.images && project.images[0] ? (
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700" />
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {project.title}
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                          {project.status === 'in-progress' ? 'In Progress' : 'Completed'}
                        </Badge>
                        {project.featured && (
                          <Badge variant="outline">Featured</Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>
                      {project.client && (
                        <p className="text-sm text-gray-500 mb-3">
                          Client: {project.client}
                        </p>
                      )}
                      <p className="text-gray-600 line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
