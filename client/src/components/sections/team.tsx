import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Twitter } from 'lucide-react';

const teamMembers = [
  {
    name: 'Dr. Tendai Mukamuri',
    position: 'Managing Director',
    bio: '15+ years in corporate law and regulatory compliance. PhD in Business Administration, LLB in Corporate Law.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Ms. Grace Chivasa',
    position: 'Head of Compliance',
    bio: 'Former SEC regulator with expertise in securities law and corporate governance. CPA, LLM in Securities Law.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Mr. James Nyathi',
    position: 'Chief Technology Officer',
    bio: 'AI and machine learning expert specializing in regulatory technology. MSc Computer Science, 10+ years in fintech.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Ms. Patricia Mupfumi',
    position: 'Senior Business Analyst',
    bio: 'Strategy and operations expert with Big 4 consulting background. MBA, CFA, specializing in African markets.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Mr. David Mushonga',
    position: 'Legal Counsel',
    bio: 'Corporate lawyer with extensive experience in mergers, acquisitions, and regulatory compliance. LLB, LLM.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Ms. Rutendo Gapare',
    position: 'Financial Advisory Lead',
    bio: 'Investment banking and corporate finance specialist. CA(Z), CFA, with expertise in capital markets.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
];

export function TeamSection() {
  const { t } = useTranslation();

  return (
    <section id="team" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('team.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('team.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <img 
                src={member.image}
                alt={`${member.name} - ${member.position}`}
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-blue font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  {member.bio}
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
