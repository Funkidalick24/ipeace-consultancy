import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website'
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    if (title) {
      document.title = title;
    }

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (description) {
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }
    }

    // Update or create keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (keywords) {
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      } else {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        metaKeywords.setAttribute('content', keywords);
        document.head.appendChild(metaKeywords);
      }
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonical);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', canonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // Update Open Graph tags
    const updateOGTag = (property: string, content: string) => {
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', property);
        ogTag.setAttribute('content', content);
        document.head.appendChild(ogTag);
      }
    };

    if (ogTitle) updateOGTag('og:title', ogTitle);
    if (ogDescription) updateOGTag('og:description', ogDescription);
    if (ogImage) updateOGTag('og:image', ogImage);
    if (ogType) updateOGTag('og:type', ogType);

    // Update Twitter tags
    const updateTwitterTag = (name: string, content: string) => {
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        twitterTag = document.createElement('meta');
        twitterTag.setAttribute('name', name);
        twitterTag.setAttribute('content', content);
        document.head.appendChild(twitterTag);
      }
    };

    if (ogTitle) updateTwitterTag('twitter:title', ogTitle);
    if (ogDescription) updateTwitterTag('twitter:description', ogDescription);
    if (ogImage) updateTwitterTag('twitter:image', ogImage);

  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogType]);

  return null;
};

// Predefined SEO configurations for different pages
export const pageSEO = {
  home: {
    title: 'IPEACE Professional Consulting - Business Consulting Zimbabwe',
    description: 'Expert consulting in regulatory compliance, corporate governance, and business strategy for Zimbabwean businesses. Navigate legal frameworks with confidence.',
    keywords: 'IPEACE, business consulting, regulatory compliance, corporate governance, business strategy, Zimbabwe business, compliance consulting',
    canonical: 'https://ipeace-consultancy.com/',
    ogTitle: 'IPEACE Professional Consulting - Business Consulting',
    ogDescription: 'Expert consulting in regulatory compliance, corporate governance, and business strategy for Zimbabwean businesses.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  },
  about: {
    title: 'About IPEACE - Professional Business Consulting Zimbabwe',
    description: 'Learn about IPEACE Professional Consulting - your trusted partner for regulatory compliance, corporate governance, and business strategy in Zimbabwe.',
    keywords: 'about IPEACE, business consulting Zimbabwe, regulatory compliance experts, corporate governance Zimbabwe',
    canonical: 'https://ipeace-consultancy.com/about',
    ogTitle: 'About IPEACE - Professional Business Consulting',
    ogDescription: 'Learn about IPEACE Professional Consulting - your trusted partner for regulatory compliance and business strategy in Zimbabwe.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  },
  services: {
    title: 'Business Consulting Services - IPEACE Professional Consulting',
    description: 'Comprehensive business consulting services including regulatory compliance, corporate governance, and strategic planning for Zimbabwean businesses.',
    keywords: 'business consulting services, regulatory compliance Zimbabwe, corporate governance services, business strategy consulting',
    canonical: 'https://ipeace-consultancy.com/services',
    ogTitle: 'Business Consulting Services - IPEACE',
    ogDescription: 'Comprehensive business consulting services for regulatory compliance and strategic planning in Zimbabwe.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  },
  contact: {
    title: 'Contact IPEACE - Business Consulting Zimbabwe',
    description: 'Get in touch with IPEACE Professional Consulting for expert advice on regulatory compliance, corporate governance, and business strategy.',
    keywords: 'contact IPEACE, business consulting Zimbabwe, regulatory compliance contact, corporate governance experts',
    canonical: 'https://ipeace-consultancy.com/contact',
    ogTitle: 'Contact IPEACE - Business Consulting',
    ogDescription: 'Get in touch with IPEACE Professional Consulting for expert business consulting services in Zimbabwe.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  },
  faq: {
    title: 'FAQ - Business Consulting Questions Answered | IPEACE',
    description: 'Frequently asked questions about business consulting, regulatory compliance, and corporate governance in Zimbabwe. Expert answers from IPEACE.',
    keywords: 'business consulting FAQ, regulatory compliance questions, corporate governance FAQ, Zimbabwe business questions',
    canonical: 'https://ipeace-consultancy.com/faq',
    ogTitle: 'FAQ - Business Consulting Questions Answered',
    ogDescription: 'Frequently asked questions about business consulting and regulatory compliance in Zimbabwe.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  },
  blogs: {
    title: 'Business Consulting Blog - IPEACE Professional Consulting',
    description: 'Stay updated with the latest insights on regulatory compliance, corporate governance, and business strategy in Zimbabwe.',
    keywords: 'business consulting blog, regulatory compliance blog, corporate governance blog, Zimbabwe business insights',
    canonical: 'https://ipeace-consultancy.com/blogs',
    ogTitle: 'Business Consulting Blog - IPEACE',
    ogDescription: 'Latest insights on regulatory compliance and business strategy in Zimbabwe.',
    ogImage: 'https://ipeace-consultancy.com/logo.png'
  }
};