import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePublicCsrf } from '@/lib/csrf';

// =============================================================================
// POST /api/payments - Process payment for an order
// =============================================================================
// Supports:
// - Cash: completed immediately
// - Card (credit/debit): creates a pending payment intent
//   When STRIPE_SECRET_KEY is configured, processes via Stripe.
//   Otherwise returns a payment record in pending status.
// =============================================================================

const paymentSchema = z.object({
  orderId: z.string().uuid('Gecersiz siparis ID'),
  restaurantId: z.string().uuid('Gecersiz restoran ID'),
  amount: z.number().positive('Tutar pozitif olmalidir'),
  tipAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'online', 'other']),
});

// ---------------------------------------------------------------------------
// Stripe integration (optional - activated when env var is set)
// ---------------------------------------------------------------------------

async function processCardPayment(
  amount: number,
  tipAmount: number,
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    return { success: false, error: 'payment_processor_not_configured' };
  }

  try {
    // Use Stripe REST API directly to avoid requiring stripe npm package
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: String(Math.round((amount + tipAmount) * 100)),
        currency: 'try',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[tipAmount]': String(tipAmount),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData?.error?.message || 'Stripe API error' };
    }

    const paymentIntent = await response.json();
    return {
      success: true,
      transactionId: paymentIntent.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment processing error';
    console.error('[Payment API] Stripe error:', message);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // CSRF check (lenient - allows webhook callbacks without origin)
  if (!validatePublicCsrf(request)) {
    return NextResponse.json({ error: 'Gecersiz istek kaynagi.' }, { status: 403 });
  }

  // Rate limiting
  const { limited } = rateLimit(ip, {
    prefix: 'payments',
    maxRequests: 20,
    windowMs: 60_000,
  });

  if (limited) {
    return NextResponse.json(
      { error: 'Cok fazla istek. Lutfen bekleyin.' },
      { status: 429 }
    );
  }

  // Parse & validate
  let body: z.infer<typeof paymentSchema>;
  try {
    const raw = await request.json();
    body = paymentSchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Gecersiz odeme verisi.', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Gecersiz istek.' }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify order exists and belongs to restaurant
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, total_amount, status, restaurant_id')
    .eq('id', body.orderId)
    .eq('restaurant_id', body.restaurantId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: 'Siparis bulunamadi.' }, { status: 404 });
  }

  if (order.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Iptal edilmis siparis icin odeme alinamaz.' },
      { status: 400 }
    );
  }

  // Verify amount matches order total exactly
  const orderTotal = Math.round(Number(order.total_amount) * 100) / 100;
  const paymentAmount = Math.round(body.amount * 100) / 100;
  if (paymentAmount !== orderTotal) {
    return NextResponse.json(
      { error: `Odeme tutari siparis tutariyla uyusmuyor. Beklenen: ${orderTotal}` },
      { status: 400 }
    );
  }

  // Check for duplicate completed payment
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id')
    .eq('order_id', body.orderId)
    .eq('status', 'completed')
    .maybeSingle();

  if (existingPayment) {
    return NextResponse.json(
      { error: 'Bu siparis icin odeme zaten alinmis.' },
      { status: 409 }
    );
  }

  // Process payment based on method
  let paymentStatus: string;
  let provider: string | null = null;
  let providerTransactionId: string | null = null;

  if (body.paymentMethod === 'cash') {
    // Cash payments are completed immediately
    paymentStatus = 'completed';
  } else {
    // Card/online payments - try Stripe
    const stripeResult = await processCardPayment(
      body.amount,
      body.tipAmount,
    );

    if (stripeResult.success && stripeResult.transactionId) {
      paymentStatus = 'completed';
      provider = 'stripe';
      providerTransactionId = stripeResult.transactionId;
    } else if (stripeResult.error === 'payment_processor_not_configured') {
      // No payment processor configured - save as pending
      paymentStatus = 'pending';
      provider = 'not_configured';
    } else {
      return NextResponse.json(
        { error: 'Odeme islenemedi. Lutfen tekrar deneyin.' },
        { status: 502 }
      );
    }
  }

  // Create payment record
  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      restaurant_id: body.restaurantId,
      order_id: body.orderId,
      amount: body.amount,
      tip_amount: body.tipAmount,
      payment_method: body.paymentMethod,
      status: paymentStatus,
      provider,
      provider_transaction_id: providerTransactionId,
      metadata: {},
    })
    .select('id, amount, tip_amount, status, payment_method, created_at')
    .single();

  if (paymentError) {
    console.error('[Payment API] Insert error:', paymentError.message);
    return NextResponse.json(
      { error: 'Odeme kaydedilemedi.' },
      { status: 500 }
    );
  }

  // Update order status to delivered if payment completed
  if (paymentStatus === 'completed') {
    await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', body.orderId);
  }

  return NextResponse.json(
    {
      success: true,
      payment,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    },
    { status: 201 }
  );
}
