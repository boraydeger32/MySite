import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePublicCsrf } from '@/lib/csrf';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const contactSchema = z.object({
  name: z.string().min(1, 'Ad Soyad zorunludur').max(100),
  email: z.string().email('Gecerli bir email adresi giriniz').max(254),
  phone: z.string().max(20).optional(),
  service: z.string().min(1, 'Hizmet secimi zorunludur').max(100),
  message: z.string().min(10, 'Mesaj en az 10 karakter olmalidir').max(5000),
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
  const { limited, remaining } = rateLimit(ip, {
    prefix: 'contact',
    maxRequests: 5,
    windowMs: 60_000,
  });

  if (limited) {
    return NextResponse.json(
      { success: false, message: 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    // Persist to Supabase
    const supabase = await createClient();
    const { error } = await supabase.from('contact_submissions').insert({
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      service: validated.service,
      message: validated.message,
      ip_address: ip !== 'unknown' ? ip : null,
    });

    if (error) {
      // Log server-side only, don't expose to client
      console.error('[Contact API] Insert error:', error.message);
      return NextResponse.json(
        { success: false, message: 'Mesajiniz kaydedilemedi. Lutfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mesajiniz alindi! En kisa surede size donecegiz.',
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
