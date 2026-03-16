import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Restaurant } from '@/lib/supabase/types';
import type { Metadata } from 'next';

// Required for static export (GitHub Pages)
export function generateStaticParams() {
  return [{ 'restoran-slug': 'demo' }];
}

// =============================================================================
// Public Restaurant Landing Page
// =============================================================================
// Fetches restaurant data by slug and displays restaurant info or redirects
// to table selection. Accessible at /[restoran-slug]
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PageProps {
  params: Promise<{ 'restoran-slug': string }>;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'restoran-slug': slug } = await params;

  let restaurant: Restaurant | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    restaurant = data as Restaurant | null;
  } catch {
    // Supabase not configured - use fallback
  }

  if (!restaurant) {
    return { title: 'Restoran Bulunamadi' };
  }

  return {
    title: `${restaurant.name} | QR Menu`,
    description: `${restaurant.name} dijital menu - QR kod ile siparis verin.`,
    openGraph: {
      title: `${restaurant.name} | QR Menu`,
      description: `${restaurant.name} dijital menu - QR kod ile siparis verin.`,
      images: restaurant.cover_url ? [{ url: restaurant.cover_url }] : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Mock restaurant for demo
// ---------------------------------------------------------------------------

const DEMO_RESTAURANT: Restaurant = {
  id: 'demo-restaurant-001',
  owner_id: 'demo-owner',
  name: 'Demo Restoran',
  slug: 'demo-restoran',
  logo_url: null,
  cover_url: null,
  theme: {
    primaryColor: '#FF6B2B',
    secondaryColor: '#1E40AF',
    backgroundColor: '#050A14',
    textColor: '#F0F4FF',
    cardBackground: '#0D1524',
    fontFamily: 'Plus Jakarta Sans',
    layout: 'grid',
    categoryNavPosition: 'top',
    borderRadius: '12px',
  },
  settings: {
    currency: 'TRY',
    taxRate: 10,
    language: 'tr',
    address: 'Ornek Mah. Demo Cad. No:1, Istanbul',
    phone: '+90 212 000 00 00',
    workingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '23:00' },
      saturday: { open: '10:00', close: '23:00' },
      sunday: { open: '10:00', close: '22:00' },
    },
    socialMedia: {
      instagram: 'demorestoran',
      website: 'https://demorestoran.com',
    },
  },
  plan: 'pro',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Helper: Day name in Turkish
// ---------------------------------------------------------------------------

const DAY_NAMES: Record<string, string> = {
  monday: 'Pazartesi',
  tuesday: 'Sali',
  wednesday: 'Carsamba',
  thursday: 'Persembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
  sunday: 'Pazar',
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default async function RestoranPage({ params }: PageProps) {
  const { 'restoran-slug': slug } = await params;

  let restaurant: Restaurant | null = null;

  // Try fetching from Supabase
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    restaurant = data as Restaurant | null;
  } catch {
    // Supabase not configured - fall back to demo
  }

  // Use demo data for the demo slug
  if (!restaurant && slug === 'demo-restoran') {
    restaurant = DEMO_RESTAURANT;
  }

  // 404 if restaurant not found
  if (!restaurant) {
    notFound();
  }

  // Extract theme
  const theme = restaurant.theme;
  const primaryColor = theme.primaryColor ?? '#FF6B2B';
  const backgroundColor = theme.backgroundColor ?? '#050A14';
  const textColor = theme.textColor ?? '#F0F4FF';
  const cardBackground = theme.cardBackground ?? '#0D1524';
  const borderRadius = theme.borderRadius ?? '12px';

  // Extract settings
  const settings = restaurant.settings;
  const workingHours = settings?.workingHours;
  const socialMedia = settings?.socialMedia;

  return (
    <div
      className="flex min-h-screen flex-col items-center"
      style={{ backgroundColor, color: textColor }}
    >
      {/* Cover Image / Header */}
      <div className="relative w-full">
        {restaurant.cover_url ? (
          <div className="relative h-48 w-full overflow-hidden sm:h-64">
            <img
              src={restaurant.cover_url}
              alt={`${restaurant.name} kapak gorseli`}
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 40%, ${backgroundColor})`,
              }}
            />
          </div>
        ) : (
          <div
            className="h-32 w-full sm:h-48"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}30, ${backgroundColor})`,
            }}
          />
        )}
      </div>

      {/* Restaurant Info Card */}
      <div className="w-full max-w-lg px-4 -mt-8 relative z-10">
        <div
          className="flex flex-col items-center p-6 text-center"
          style={{
            backgroundColor: cardBackground,
            borderRadius,
            border: `1px solid ${textColor}10`,
          }}
        >
          {/* Logo */}
          {restaurant.logo_url ? (
            <div
              className="-mt-14 mb-4 h-20 w-20 overflow-hidden border-4 shadow-lg"
              style={{
                borderRadius,
                borderColor: cardBackground,
                backgroundColor: `${textColor}08`,
              }}
            >
              <img
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="-mt-14 mb-4 flex h-20 w-20 items-center justify-center border-4 text-2xl font-bold shadow-lg"
              style={{
                borderRadius,
                borderColor: cardBackground,
                backgroundColor: primaryColor,
                color: '#fff',
              }}
            >
              {restaurant.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Restaurant Name */}
          <h1
            className="text-2xl font-bold"
            style={{ color: textColor }}
          >
            {restaurant.name}
          </h1>

          {/* Address */}
          {settings?.address && (
            <p
              className="mt-2 text-sm"
              style={{ color: `${textColor}70` }}
            >
              {settings.address}
            </p>
          )}

          {/* Phone */}
          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="mt-1 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: primaryColor }}
            >
              {settings.phone}
            </a>
          )}

          {/* Social Media Links */}
          {socialMedia && (
            <div className="mt-3 flex items-center gap-3">
              {socialMedia.instagram && (
                <a
                  href={`https://instagram.com/${socialMedia.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: `${textColor}80` }}
                >
                  @{socialMedia.instagram}
                </a>
              )}
              {socialMedia.website && (
                <a
                  href={socialMedia.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium transition-opacity hover:opacity-80"
                  style={{ color: `${textColor}80` }}
                >
                  Web Sitesi
                </a>
              )}
            </div>
          )}

          {/* Working Hours */}
          {workingHours && (
            <div className="mt-5 w-full">
              <h3
                className="mb-2 text-sm font-semibold"
                style={{ color: `${textColor}90` }}
              >
                Calisma Saatleri
              </h3>
              <div className="space-y-1">
                {Object.entries(workingHours).map(([day, hours]) => {
                  if (!hours) return null;
                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between text-xs"
                    >
                      <span style={{ color: `${textColor}70` }}>
                        {DAY_NAMES[day] ?? day}
                      </span>
                      <span style={{ color: `${textColor}90` }}>
                        {hours.open} - {hours.close}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QR Menu CTA */}
          <div className="mt-6 w-full">
            <p
              className="mb-3 text-sm"
              style={{ color: `${textColor}60` }}
            >
              Masaniza ait QR kodu okutarak menuyu goruntuleyebilirsiniz.
            </p>
            <a
              href={`/${slug}/masa/1`}
              className="inline-flex w-full items-center justify-center gap-2 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: primaryColor,
                borderRadius,
              }}
            >
              Menuyu Goruntule
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto w-full px-4 py-8 text-center">
        <p
          className="text-xs"
          style={{ color: `${textColor}30` }}
        >
          QR Menu &copy; {new Date().getFullYear()} DevSpark Yazilim
        </p>
      </div>
    </div>
  );
}
