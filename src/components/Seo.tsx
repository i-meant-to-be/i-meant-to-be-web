import { Helmet } from 'react-helmet-async';
import seo from '../routes/seo';

const SITE_URL = 'https://imeantto.be';
const SITE_NAME = 'imeanttobe';

interface SeoProps {
  path: string;
}

export default function Seo({ path }: SeoProps) {
  const { title, description, noindex } = seo[path];
  const url = `${SITE_URL}${path}`;
  const fullTitle = path === '/' ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? 'noindex, follow' : 'index, follow'}
      />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
}
