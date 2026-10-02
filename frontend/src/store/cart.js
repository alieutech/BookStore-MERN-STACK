import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_QUANTITY = 99;

// The cart only keeps book IDs and quantities (saved in localStorage).
// Titles and prices are always read from the latest book list, so they never go stale.
export const useCartStore = create(
  persist(
    (set) => ({
      items: [], // [{ bookId, quantity }]

      addItem: (bookId) =>
        set((state) => {
          const existing = state.items.find((item) => item.bookId === bookId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.bookId === bookId ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) } : item
              ),
            };
          }
          return { items: [...state.items, { bookId, quantity: 1 }] };
        }),

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
