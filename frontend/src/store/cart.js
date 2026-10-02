import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_QUANTITY = 99;

// The cart only keeps book IDs and quantities (saved in localStorage).
// Titles and prices are always read from the latest book list, so they never go stale.
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ bookId, quantity }]

      // Add one copy, up to `max` (the copies in stock). Returns false when the limit is reached.
      addItem: (bookId, max = MAX_QUANTITY) => {
        const limit = Math.min(max, MAX_QUANTITY);
        const existing = get().items.find((item) => item.bookId === bookId);
        if ((existing?.quantity || 0) >= limit) return false;
        set((state) => ({
          items: existing
            ? state.items.map((item) => (item.bookId === bookId ? { ...item, quantity: item.quantity + 1 } : item))
            : [...state.items, { bookId, quantity: 1 }],
        }));
        return true;
      },

      setQuantity: (bookId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.bookId === bookId ? { ...item, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) } : item
          ),
        })),

      removeItem: (bookId) => set((state) => ({ items: state.items.filter((item) => item.bookId !== bookId) })),

      // Drop books that no longer exist in the store
      keepOnly: (bookIds) => set((state) => ({ items: state.items.filter((item) => bookIds.includes(item.bookId)) })),

      clear: () => set({ items: [] }),
    }),
    { name: "bookstore-cart" }
  )
);

export const useCartCount = () => useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

export { MAX_QUANTITY };
