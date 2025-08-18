import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin } from 'lucide-react';
import { BiLogoTwitter } from 'react-icons/bi';

const teamMembers = [
  {
    name: 'Wilberforce T. Mushore',
    position: 'Co-Founder & Director – Compliance and Regulatory Strategy',
    bio: 'Wilberforce leads iPeace\'s compliance advisory, helping solopreneurs and SMEs navigate legal frameworks with confidence. He specializes in regulatory alignment, ethical governance, and risk mitigation—ensuring that businesses are built on solid, sustainable foundations. His approach is grounded in clarity, integrity, and long-term resilience.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Aleta Marime',
    position: 'Co-Founder & Director – Financial Systems and Sustainability',
    bio: 'Aleta guides clients through financial planning, resource management, and investment readiness. She works with founders to build sustainable financial models, improve cash flow visibility, and prepare for growth. Her strength lies in simplifying financial complexity and helping businesses make informed, strategic decisions.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
  {
    name: 'Clarence R. Makwasha',
    position: 'Director – Operational Strategy and Brand Identity',
    bio: 'Clarence empowers solopreneurs and SMEs to build systems that reflect their mission and scale with clarity. He designs branded materials, workflows, and communication tools that elevate professionalism and client experience. Known for his structured thinking and design expertise, Clarence helps founders move from vision to execution with confidence.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=400'
  },
];

export const TeamSection = memo(function TeamSection() {
  const { t } = useTranslation();

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
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <img
                src={member.image}
                alt={`${member.name} - ${member.position}`}
                className="w-full h-64 object-cover"
              />
              <CardContent className="p-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-blue font-medium mb-3">
                  {member.position}
                </p>
                <p className="text-gray-700 text-sm mb-4">
                  {member.bio}
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                    onClick={() => window.open('https://linkedin.com/company/ipeace', '_blank')}
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-primary-blue transition-colors duration-200 h-8 w-8"
                    onClick={() => window.open('https://twitter.com/ipeace', '_blank')}
                    aria-label="Twitter"
                  >
                    <BiLogoTwitter className="h-4 w-4" />
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
