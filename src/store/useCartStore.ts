import { create } from 'zustand';

// =============================================================================
// Customer Cart Store (Zustand)
// =============================================================================
// Manages the shopping cart state for the public customer QR menu.
// Used at /[restoran-slug]/masa/[masa-no] for order building.
// =============================================================================

export interface CartModifier {
  groupName: string;
  label: string;
  price: number;
}

export interface CartItem {
  /** Unique cart entry ID (generated at add time, allows duplicate products with different modifiers) */
  cartId: string;
  /** Menu item ID from database */
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: CartModifier[];
  notes: string;
  image_url: string | null;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;

  /** Set the restaurant and table context for the cart */
  setContext: (restaurantId: string, tableId: string) => void;

  /** Add a new item to the cart (generates cartId automatically) */
  addItem: (item: Omit<CartItem, 'cartId'>) => void;

  /** Remove an item by its cartId */
  removeItem: (cartId: string) => void;

  /** Update the quantity of a cart item */
  updateQuantity: (cartId: string, quantity: number) => void;

  /** Increment quantity by 1 */
  incrementQuantity: (cartId: string) => void;

  /** Decrement quantity by 1 (removes if quantity reaches 0) */
  decrementQuantity: (cartId: string) => void;

  /** Clear all items from the cart */
  clearCart: () => void;

  /** Get total number of items in the cart */
  totalItems: () => number;

  /** Get the subtotal (items + modifiers, before tax/discount) */
  totalAmount: () => number;
}

/** Generate a unique cart entry ID */
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Calculate the total price of a single cart item including modifiers */
function itemTotal(item: CartItem): number {
  const modifierTotal = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
  return (item.price + modifierTotal) * item.quantity;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  tableId: null,

  setContext: (restaurantId, tableId) => set({ restaurantId, tableId }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, cartId: generateCartId() }],
    })),

  removeItem: (cartId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartId !== cartId),
    })),

  updateQuantity: (cartId, quantity) =>
    set((state) => ({
      items:
        quantity <= 0
          ? state.items.filter((i) => i.cartId !== cartId)
          : state.items.map((i) =>
              i.cartId === cartId ? { ...i, quantity } : i
            ),
    })),

  incrementQuantity: (cartId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i
      ),
    })),

  decrementQuantity: (cartId) =>
    set((state) => {
      const item = state.items.find((i) => i.cartId === cartId);
      if (!item) return state;
      if (item.quantity <= 1) {
        return { items: state.items.filter((i) => i.cartId !== cartId) };
      }
      return {
        items: state.items.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity - 1 } : i
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  totalItems: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  totalAmount: () =>
    get().items.reduce((sum, item) => sum + itemTotal(item), 0),
}));
