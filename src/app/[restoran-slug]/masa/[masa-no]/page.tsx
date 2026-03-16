import dynamic from 'next/dynamic';

const MasaPageClient = dynamic(() => import('./MasaPageClient'), { ssr: false });

export function generateStaticParams() {
  return [{ 'restoran-slug': 'demo', 'masa-no': '1' }];
}

export const dynamicParams = true;

export default function MasaMenuPage() {
  return <MasaPageClient />;
}
