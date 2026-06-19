import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Sistem Informasi Geografis - Desa Cibulakan Cianjur';
const DEFAULT_DESC = 'Platform GIS interaktif untuk memetakan dan menjelajahi lokasi-lokasi di Desa Cibulakan, Kecamatan Cianjur, Jawa Barat.';
const BASE_URL = import.meta.env.VITE_APP_URL || 'https://zonasi-gis.example.com';

export default function SEO({ title, description, image, type = 'website', url, jsonLd }) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const ogImage = image || '/logo_cianjur.png';
  const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
