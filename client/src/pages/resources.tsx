import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BookOpen, Download, ExternalLink, Calendar, User, Link, Share2 } from 'lucide-react';
import { BacklinkTracker } from '@/components/seo/backlink-tracker';

// Lazy load chatbot widget
const ChatbotWidget = lazy(() => import('@/components/chatbot/chatbot-widget').then(module => ({ default: module.ChatbotWidget })));

export default function Resources() {
  const resources = [
    {
      type: 'guide',
      title: 'Complete Guide to Company Registration in Zimbabwe 2025',
      description: 'Step-by-step guide covering all requirements for registering different types of companies in Zimbabwe, including costs, timelines, and required documents.',
      category: 'Company Registration',
      readTime: '15 min read',
      downloads: '2.3k',
      link: '#',
      featured: true
    },
    {
      type: 'checklist',
      title: 'Zimbabwe Business Compliance Checklist',
      description: 'Comprehensive checklist covering all regulatory requirements for businesses operating in Zimbabwe, including tax compliance, licensing, and reporting obligations.',
      category: 'Compliance',
      readTime: '8 min read',
      downloads: '5.1k',
      link: '#',
      featured: true
    },
    {
      type: 'guide',
      title: 'Understanding Zimbabwe\'s Companies Act Chapter 24:03',
      description: 'Detailed breakdown of the Companies Act, including recent amendments, compliance requirements, and implications for business owners.',
      category: 'Legal Framework',
      readTime: '20 min read',
      downloads: '1.8k',
      link: '#',
      featured: false
    },
    {
      type: 'template',
      title: 'Business License Application Template',
      description: 'Ready-to-use templates for applying for various business licenses in Zimbabwe, including trading licenses, tax clearance, and industry-specific permits.',
      category: 'Licensing',
      readTime: '5 min read',
      downloads: '3.7k',
      link: '#',
      featured: false
    },
    {
      type: 'guide',
      title: 'Tax Compliance Guide for Zimbabwe Businesses',
      description: 'Complete guide to corporate tax, VAT, PAYE, and other tax obligations for businesses in Zimbabwe, including filing deadlines and penalty structures.',
      category: 'Tax Compliance',
      readTime: '18 min read',
      downloads: '2.9k',
      link: '#',
      featured: false
    },
    {
      type: 'checklist',
      title: 'Annual Returns Filing Checklist',
      description: 'Step-by-step checklist for filing annual returns with the Companies Office, including required documents and common pitfalls to avoid.',
      category: 'Compliance',
      readTime: '10 min read',
      downloads: '1.5k',
      link: '#',
      featured: false
    }
  ];

  const categories = ['All', 'Company Registration', 'Compliance', 'Legal Framework', 'Licensing', 'Tax Compliance'];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary-blue to-secondary-blue text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Zimbabwe Business Resources & Guides
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Free comprehensive guides, checklists, and templates to help you navigate Zimbabwe's business landscape with confidence.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {categories.slice(1).map((category) => (
                <Badge key={category} variant="secondary" className="px-4 py-2 text-sm">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Free Resources
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Backlink Strategy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources">
              <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Featured Resources</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {resources.filter(r => r.featured).map((resource, index) => (
              <Card key={index} className="bg-white shadow-lg border-0 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className="bg-primary-blue text-white">
                      {resource.type}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Download className="h-4 w-4 mr-1" />
                      {resource.downloads}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 mb-4">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-1" />
                      {resource.readTime}
                    </div>
                    <Button className="btn-primary">
                      <Download className="h-4 w-4 mr-2" />
                      Download Free
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* All Resources */}
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">All Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                    <div className="flex items-center text-xs text-gray-500">
                      <Download className="h-3 w-3 mr-1" />
                      {resource.downloads}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{resource.readTime}</span>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Free Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </TabsContent>

            <TabsContent value="backlinks">
              <BacklinkTracker />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-blue to-secondary-blue text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Personalized Business Guidance?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Our consultants can provide tailored advice for your specific business situation in Zimbabwe.
          </p>
          <Button
            className="btn-accent px-8 py-4 text-lg"
            onClick={() => window.location.href = '/contact'}
          >
            Get Free Consultation
          </Button>
        </div>
      </section>

      <Footer />
      <Suspense fallback={null}>
        <ChatbotWidget />
      </Suspense>
    </div>
  );
}