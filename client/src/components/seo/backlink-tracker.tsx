import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Share2, ExternalLink, Link, Users, TrendingUp } from 'lucide-react';

interface BacklinkData {
  domain: string;
  url: string;
  anchor: string;
  date: string;
  status: 'active' | 'broken' | 'pending';
}

export const BacklinkTracker = () => {
  const [backlinks] = useState<BacklinkData[]>([
    {
      domain: 'zimra.co.zw',
      url: 'https://zimra.co.zw/business-resources',
      anchor: 'IPEACE Professional Consulting',
      date: '2025-01-15',
      status: 'active'
    },
    {
      domain: 'businesszim.com',
      url: 'https://businesszim.com/consultants/ipeace',
      anchor: 'Zimbabwe business compliance experts',
      date: '2025-02-01',
      status: 'active'
    }
  ]);

  const shareableContent = [
    {
      title: 'Complete Guide to Company Registration in Zimbabwe 2025',
      url: '/resources/company-registration-guide',
      description: 'Step-by-step guide covering all requirements for registering different types of companies in Zimbabwe.'
    },
    {
      title: 'Zimbabwe Business Compliance Checklist',
      url: '/resources/compliance-checklist',
      description: 'Comprehensive checklist covering all regulatory requirements for businesses operating in Zimbabwe.'
    },
    {
      title: 'Understanding Zimbabwe\'s Companies Act Chapter 24:03',
      url: '/resources/companies-act-guide',
      description: 'Detailed breakdown of the Companies Act, including recent amendments and compliance requirements.'
    }
  ];

  const shareOnSocial = (platform: string, content: typeof shareableContent[0]) => {
    const baseUrl = 'https://ipeace.co.zw';
    const shareUrl = `${baseUrl}${content.url}`;
    const shareText = `${content.title} - ${content.description}`;

    let shareLink = '';

    switch (platform) {
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Shareable Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Shareable Content for Backlinks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shareableContent.map((content, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
                <p className="text-gray-600 mb-3">{content.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareOnSocial('linkedin', content)}
                  >
                    Share on LinkedIn
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareOnSocial('twitter', content)}
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareOnSocial('facebook', content)}
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`https://ipeace.co.zw${content.url}`)}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Copy Link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backlink Monitoring Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Backlink Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backlinks.map((backlink, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{backlink.domain}</span>
                    <Badge
                      variant={backlink.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {backlink.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Anchor: "{backlink.anchor}"
                  </p>
                  <p className="text-xs text-gray-500">
                    Acquired: {new Date(backlink.date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(backlink.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Backlink Strategy Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Share your comprehensive guides on Zimbabwe business forums</li>
              <li>• Guest post on business blogs and legal websites</li>
              <li>• Participate in Zimbabwe business communities and discussions</li>
              <li>• Create infographics about compliance requirements</li>
              <li>• Network with other Zimbabwe business service providers</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Mention Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Brand Mention Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24</div>
                <div className="text-sm text-green-800">Positive Mentions</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-blue-800">Backlinks</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-purple-800">Social Shares</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Recent Mentions:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">BusinessZim.com - "Top compliance consultants"</span>
                  <span className="text-xs text-gray-500">2 days ago</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">LinkedIn - Professional recommendation</span>
                  <span className="text-xs text-gray-500">1 week ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};