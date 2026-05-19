import dynamic from 'next/dynamic';
import { DEMO_RESTAURANT_SLUG } from '@/lib/constants';

const MasaPageClient = dynamic(() => import('./MasaPageClient'), { ssr: false });

export function generateStaticParams() {
  return [{ 'restoran-slug': DEMO_RESTAURANT_SLUG, 'masa-no': '1' }];
}

export const dynamicParams = true;

export default function MasaMenuPage() {
  return <MasaPageClient />;
}
