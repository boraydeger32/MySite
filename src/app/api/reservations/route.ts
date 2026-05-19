import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePublicCsrf } from '@/lib/csrf';

// =============================================================================
// POST /api/reservations - Public reservation creation
// =============================================================================

const reservationSchema = z.object({
  restaurantId: z.string().uuid(),
  customerName: z.string().min(2, 'Ad en az 2 karakter').max(100),
  customerPhone: z.string().max(20).optional(),
  customerEmail: z.string().email().max(254).optional(),
  partySize: z.number().int().min(1).max(50),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD formati'),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, 'HH:MM formati'),
  notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // CSRF check (lenient for public endpoints)
  if (!validatePublicCsrf(request)) {
    return NextResponse.json({ error: 'Gecersiz istek kaynagi.' }, { status: 403 });
  }

  const { limited } = rateLimit(ip, {
    prefix: 'reservations',
    maxRequests: 5,
    windowMs: 60_000,
  });

  if (limited) {
    return NextResponse.json(
      { error: 'Cok fazla istek. Lutfen bekleyin.' },
      { status: 429 }
    );
  }

  let body: z.infer<typeof reservationSchema>;
  try {
    const raw = await request.json();
    body = reservationSchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Gecersiz rezervasyon verisi.', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Gecersiz istek.' }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify restaurant exists and is active
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id, status')
    .eq('id', body.restaurantId)
    .single();

  if (!restaurant || restaurant.status !== 'active') {
    return NextResponse.json({ error: 'Restoran bulunamadi.' }, { status: 404 });
  }

  // Validate date is not in the past
  const reservationDate = new Date(`${body.reservationDate}T${body.reservationTime}:00`);
  if (reservationDate < new Date()) {
    return NextResponse.json(
      { error: 'Gecmis bir tarih icin rezervasyon yapilamaz.' },
      { status: 400 }
    );
  }

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({
      restaurant_id: body.restaurantId,
      customer_name: body.customerName,
      customer_phone: body.customerPhone || null,
      customer_email: body.customerEmail || null,
      party_size: body.partySize,
      reservation_date: body.reservationDate,
      reservation_time: body.reservationTime,
      status: 'pending',
      notes: body.notes || null,
    })
    .select('id, reservation_date, reservation_time, status')
    .single();

  if (error) {
    console.error('[Reservation API] Insert error:', error.message);
    return NextResponse.json(
      { error: 'Rezervasyon olusturulamadi.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { success: true, reservation },
    { status: 201 }
  );
}
