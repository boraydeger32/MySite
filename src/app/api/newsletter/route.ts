import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePublicCsrf } from '@/lib/csrf';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const newsletterSchema = z.object({
  email: z.string().email('Gecerli bir email adresi giriniz').max(254),
});

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // CSRF check
  if (!validatePublicCsrf(request)) {
    return NextResponse.json(
      { success: false, message: 'Gecersiz istek kaynagi.' },
      { status: 403 }
    );
  }

  // Rate limiting
  const { limited } = rateLimit(ip, {
    prefix: 'newsletter',
    maxRequests: 3,
    windowMs: 60_000,
  });

  if (limited) {
    return NextResponse.json(
      { success: false, message: 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validated = newsletterSchema.parse(body);

    const supabase = await createClient();

    // Upsert: if email exists and is inactive, reactivate; if new, insert
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', validated.email)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({
          success: true,
          message: 'Bu email adresi zaten abone.',
        });
      }
      // Reactivate
      await supabase
        .from('newsletter_subscribers')
        .update({ is_active: true })
        .eq('id', existing.id);
    } else {
      // New subscriber
      const { error } = await supabase.from('newsletter_subscribers').insert({
        email: validated.email,
        is_active: true,
        source: 'website',
        ip_address: ip !== 'unknown' ? ip : null,
      });

      if (error) {
        console.error('[Newsletter API] Insert error:', error.message);
        return NextResponse.json(
          { success: false, message: 'Abonelik kaydedilemedi. Lutfen tekrar deneyin.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Basariyla abone oldunuz!',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validasyon hatasi',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Bir hata olustu.' },
      { status: 400 }
    );
  }
}
