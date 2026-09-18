export type CartItem = {
  id: string;
  name: string;
  type: string;
  price: string;
  quantity: number;
  href: string;
};

export const CART_STORAGE_KEY = "marketplace-cart";
export const CART_UPDATED_EVENT = "marketplace-cart-updated";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "quantity">) {
  const cart = readCart();
  const existing = cart.find((cartItem) => cartItem.id === item.id);
  const nextCart = existing
    ? cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      )
    : [...cart, { ...item, quantity: 1 }];

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  return nextCart;
}

export function getCartCount(cart: CartItem[]) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}
