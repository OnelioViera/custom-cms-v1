import Image from 'next/image';
import { getDatabase } from '@/lib/mongodb';
import { TeamMember } from '@/lib/models/Content';
import { Mail, Phone, Linkedin } from 'lucide-react';

async function getTeamMembers() {
  try {
    const db = await getDatabase();
    const teamCollection = db.collection<TeamMember>('team');
    
    const members = await teamCollection
      .find({})
      .sort({ order: 1 })
      .toArray();

    return members.map(m => ({
      ...m,
      _id: m._id?.toString()
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4">Our Team</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Meet the experts behind Lindsay Precast's renewable energy solutions
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No team members available at this time.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <div 
                  key={member._id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Profile Image */}
                  {member.image ? (
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2U1ZTdlYiIvPgo8L3N2Zz4="
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}

                  {/* Member Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-4">
                      {member.position}
                    </p>
                    
                    {member.bio && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {member.bio}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {member.email && (
                        <a 
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </a>
                      )}
                      {member.phone && (
                        <a 
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                      {member.linkedIn && (
                        <a 
                          href={member.linkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Our Team
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our growing team.
          </p>
          <a 
            href="mailto:careers@lindsayprecast.com"
            className="inline-block bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </section>
    </div>
  );
}
