import { memo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, User, Mail, Twitter, Facebook, Instagram, Globe } from 'lucide-react';

// Bootstrap X icon component
const BootstrapXIcon = () => (
  <i className="bi bi-twitter-x" style={{ fontSize: '1rem' }}></i>
);

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  imageUrl?: string;
  email?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export const TeamSection = memo(function TeamSection() {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team');
        if (response.ok) {
          const data = await response.json();
          // Sort by order field
          const sortedMembers = (data.members || []).sort((a: TeamMember, b: TeamMember) => a.order - b.order);
          setTeamMembers(sortedMembers);
        } else {
          console.error('Failed to fetch team members');
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) {
    return (
      <section id="team" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('team.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('team.subtitle')}
            </p>
          </div>
          <div className="text-center">Loading team members...</div>
        </div>
      </section>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <section id="team" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('team.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('team.subtitle')}
            </p>
          </div>
          <div className="text-center text-gray-600">
            No team members available at the moment.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('team.title')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('team.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <Card key={member.id} className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={`${member.name} - ${member.position}`}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-500" />
                </div>
              )}
              <CardContent className="p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-blue font-medium mb-3">
                  {member.position}
                </p>
                {member.bio && (
                  <p className="text-gray-700 text-sm mb-4">
                    {member.bio}
                  </p>
                )}
                <div className="flex space-x-3">
                  {member.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(`mailto:${member.email}`, '_blank')}
                      aria-label="Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {member.linkedinUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(member.linkedinUrl, '_blank')}
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  )}
                  {member.twitterUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(member.twitterUrl, '_blank')}
                      aria-label="Twitter"
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  )}
                  {member.facebookUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(member.facebookUrl, '_blank')}
                      aria-label="Facebook"
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                  )}
                  {member.instagramUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(member.instagramUrl, '_blank')}
                      aria-label="Instagram"
                    >
                      <Instagram className="h-4 w-4" />
                    </Button>
                  )}
                  {member.websiteUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                      onClick={() => window.open(member.websiteUrl, '_blank')}
                      aria-label="Website"
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                    onClick={() => window.open('https://x.com/ipeace', '_blank')}
                    aria-label="X (Twitter)"
                  >
                    <BootstrapXIcon />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});
