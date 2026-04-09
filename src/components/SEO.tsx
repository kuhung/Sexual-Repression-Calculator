import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

export const SEO = ({ title, description, canonicalUrl, noindex }: SEOProps) => {
  const location = useLocation();
  const currentUrl = canonicalUrl || `https://sri.kuhung.me${location.pathname}${location.search}`;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {description && <meta name="description" content={description} />}
      {description && <meta property="og:description" content={description} />}
      <link rel="canonical" href={currentUrl} />
      <meta property="og:url" content={currentUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
    </Helmet>
  );
};
