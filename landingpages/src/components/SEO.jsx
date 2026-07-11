import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, keywords, image, url }) => {
  const location = useLocation();

  useEffect(() => {
    // Determine Base URL
    const baseUrl = 'https://smansa.m-tech.fun';
    
    // Fallbacks
    const defaultTitle = 'SMAN 1 Pamekasan - Unggul, Berkarakter, Berprestasi';
    const defaultDesc = 'Website Resmi SMAN 1 Pamekasan. Sekolah Unggulan yang berdedikasi mencetak generasi cerdas berkarakter, berprestasi tingkat nasional, dan berwawasan global.';
    const defaultKeywords = 'SMAN 1 Pamekasan, SMA 1 Pamekasan, SMANSA Pamekasan, Sekolah Unggulan Pamekasan, SMA Terbaik Pamekasan, SMA Terbaik Madura, PPDB SMAN 1 Pamekasan, Alumni SMAN 1 Pamekasan';
    const defaultImage = '/logo-sma.png';

    const seoTitle = title ? `${title} | SMAN 1 Pamekasan` : defaultTitle;
    const seoDesc = description || defaultDesc;
    const seoKeywords = keywords ? `${keywords}, SMAN 1 Pamekasan` : defaultKeywords;
    const seoImage = image 
      ? (image.startsWith('http') ? image : `${baseUrl}${image}`) 
      : `${baseUrl}${defaultImage}`;
    const seoUrl = url || `${baseUrl}${location.pathname}${location.search}`;

    // Update Title
    document.title = seoTitle;

    // Helper to update or create meta tags
    const updateMeta = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      } else {
        const head = document.head;
        const newMeta = document.createElement(selector.includes('link') ? 'link' : 'meta');
        
        // Parse attributes from selector, e.g., meta[name="description"]
        const matches = selector.match(/\[(.*?)=(.*?)\]/);
        if (matches && matches.length === 3) {
          const attrName = matches[1];
          const attrVal = matches[2].replace(/['"]/g, ''); // strip quotes
          newMeta.setAttribute(attrName, attrVal);
        }
        
        newMeta.setAttribute(attribute, value);
        head.appendChild(newMeta);
      }
    };

    // Update Meta Tags
    updateMeta('meta[name="description"]', 'content', seoDesc);
    updateMeta('meta[name="title"]', 'content', seoTitle);
    updateMeta('meta[name="keywords"]', 'content', seoKeywords);
    
    // Open Graph
    updateMeta('meta[property="og:title"]', 'content', seoTitle);
    updateMeta('meta[property="og:description"]', 'content', seoDesc);
    updateMeta('meta[property="og:image"]', 'content', seoImage);
    updateMeta('meta[property="og:url"]', 'content', seoUrl);

    // Twitter
    updateMeta('meta[property="twitter:title"]', 'content', seoTitle);
    updateMeta('meta[property="twitter:description"]', 'content', seoDesc);
    updateMeta('meta[property="twitter:image"]', 'content', seoImage);
    updateMeta('meta[property="twitter:url"]', 'content', seoUrl);

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', seoUrl);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', seoUrl);
      document.head.appendChild(canonical);
    }
  }, [title, description, keywords, image, url, location.pathname, location.search]);

  return null;
};

export default SEO;
