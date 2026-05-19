import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { validatePublicCsrf } from '@/lib/csrf';

// =============================================================================
// POST /api/orders - Server-side order creation with price verification
// =============================================================================

// ---------------------------------------------------------------------------
// Request validation schema
// ---------------------------------------------------------------------------
const orderItemSchema = z.object({
  itemId: z.string().uuid('Gecersiz urun ID'),
  quantity: z.number().int().min(1, 'Miktar en az 1 olmalidir').max(50, 'Miktar en fazla 50 olabilir'),
  modifiers: z.array(z.string()).default([]),
  notes: z.string().max(500).optional(),
});

const createOrderSchema = z.object({
  restaurantId: z.string().uuid('Gecersiz restoran ID'),
  tableId: z.string().min(1, 'Masa bilgisi gerekli'),
  items: z.array(orderItemSchema).max(100),
  notes: z.string().max(1000).optional(),
});

type CreateOrderRequest = z.infer<typeof createOrderSchema>;

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // CSRF check
  if (!validatePublicCsrf(request)) {
    return NextResponse.json({ error: 'Gecersiz istek kaynagi.' }, { status: 403 });
  }

  // Rate limiting
  const { limited } = rateLimit(ip, {
    prefix: 'orders',
    maxRequests: 10,
    windowMs: 60_000,
  });

  if (limited) {
    return NextResponse.json(
      { error: 'Cok fazla istek gonderdiniz. Lutfen biraz bekleyin.' },
      { status: 429 }
    );
  }

  // Parse and validate request body
  let body: CreateOrderRequest;
  try {
    const raw = await request.json();
    body = createOrderSchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Gecersiz siparis verisi.', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gecersiz istek formati.' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // 1. Verify restaurant exists and is active
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, status')
    .eq('id', body.restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json(
      { error: 'Restoran bulunamadi.' },
      { status: 404 }
    );
  }

  if (restaurant.status !== 'active') {
    return NextResponse.json(
      { error: 'Bu restoran su anda aktif degil.' },
      { status: 403 }
    );
  }

  // 2. Handle waiter call (empty items = waiter call request)
  if (body.items.length === 0) {
    const { data: waiterOrder, error: waiterError } = await supabase
      .from('orders')
      .insert({
        restaurant_id: body.restaurantId,
        table_id: body.tableId,
        items: [],
        total_amount: 0,
        status: 'new' as const,
        notes: body.notes || null,
        waiter_called: true,
      })
      .select('id, status, created_at')
      .single();

    if (waiterError) {
      return NextResponse.json({ error: 'Garson cagrisi gonderilemedi.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: waiterOrder, waiterCall: true }, { status: 201 });
  }

  // 3. Fetch all referenced menu items from DB to verify prices
  const itemIds = body.items.map((item) => item.itemId);
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, price, modifiers, is_available, restaurant_id')
    .in('id', itemIds)
    .eq('restaurant_id', body.restaurantId);

  if (menuError || !menuItems) {
    return NextResponse.json(
      { error: 'Menu bilgileri alinamadi.' },
      { status: 500 }
    );
  }

  // 3. Build a lookup map and validate each item
  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));
  const verifiedOrderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    modifiers: string[];
  }> = [];
  let serverTotal = 0;

  for (const cartItem of body.items) {
    const dbItem = menuItemMap.get(cartItem.itemId);

    if (!dbItem) {
      return NextResponse.json(
        { error: `Urun bulunamadi: ${cartItem.itemId}` },
        { status: 400 }
      );
    }

    if (!dbItem.is_available) {
      return NextResponse.json(
        { error: `"${dbItem.name}" su anda mevcut degil.` },
        { status: 400 }
      );
    }

    if (dbItem.restaurant_id !== body.restaurantId) {
      return NextResponse.json(
        { error: 'Urun bu restorana ait degil.' },
        { status: 400 }
      );
    }

    // Calculate modifier prices from DB data
    let modifierTotal = 0;
    const modifierGroups = (dbItem.modifiers as Array<{ name: string; options: Array<{ label: string; price: number }> }>) || [];

    for (const selectedMod of cartItem.modifiers) {
      for (const group of modifierGroups) {
        const matchedOption = group.options.find((opt) => opt.label === selectedMod);
        if (matchedOption) {
          modifierTotal += matchedOption.price;
        }
      }
    }

    const lineTotal = (dbItem.price + modifierTotal) * cartItem.quantity;
    serverTotal += lineTotal;

    verifiedOrderItems.push({
      name: dbItem.name,
      quantity: cartItem.quantity,
      price: dbItem.price,
      modifiers: cartItem.modifiers,
    });
  }

  // 4. Insert order with server-verified total
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      restaurant_id: body.restaurantId,
      table_id: body.tableId,
      items: verifiedOrderItems,
      total_amount: Math.round(serverTotal * 100) / 100,
      status: 'new' as const,
      notes: body.notes || null,
      waiter_called: false,
    })
    .select('id, total_amount, status, created_at')
    .single();

  if (orderError) {
    console.error('[Order API] Insert error:', orderError.message);
    return NextResponse.json(
      { error: 'Siparis olusturulamadi. Lutfen tekrar deneyin.' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      order: {
        id: order.id,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at,
      },
    },
    { status: 201 }
  );
}
