import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  name = 'GitExplorer', 
  type = 'website',
  path = ''
}) => {
  const siteUrl = 'https://github-profile-explorer-gamma.vercel.app/';
  const fullUrl = `${siteUrl}${path.startsWith('/') ? path.slice(1) : path}`;
  const displayTitle = title ? `${title} | ${name}` : `${name} – GitHub Profile & Repository Explorer`;
  const displayDescription = description || 'Search GitHub profiles, explore repositories, stats, and more with GitExplorer.';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{displayTitle}</title>
      <meta name='description' content={displayDescription} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={displayDescription} />
      <meta property="og:image" content={`${siteUrl}og-image.png`} />

      {/* Twitter */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={displayDescription} />
      <meta name="twitter:image" content={`${siteUrl}og-image.png`} />
    </Helmet>
  );
};

export default SEO;
