import { create } from "zustand";
import { request } from "../api/request";

// The logged-in user's saved books. Loaded from the server when someone logs in.
export const useWishlistStore = create((set, get) => ({
  ids: [], // saved book IDs, for the heart buttons
  books: [], // full books, for the wishlist page (most recent first)
  isLoading: false,
  hasLoaded: false,

  load: async () => {
    set({ isLoading: true });
    try {
      const { data } = await request("/me/wishlist");
      set({ books: data, ids: data.map((book) => book._id), isLoading: false, hasLoaded: true });
    } catch (err) {
      console.error("Error loading wishlist:", err);
      set({ isLoading: false });
    }
  },

  // Save or unsave a book. The heart updates straight away and is put back if the server refuses.
  toggle: async (book) => {
    const saved = get().ids.includes(book._id);
    const previous = { ids: get().ids, books: get().books };
    set(
      saved
        ? { ids: previous.ids.filter((id) => id !== book._id), books: previous.books.filter((b) => b._id !== book._id) }
        : { ids: [...previous.ids, book._id], books: [book, ...previous.books] }
    );
    try {
      const { data, message } = await request(`/me/wishlist/${book._id}`, { method: saved ? "DELETE" : "PUT" });
      set({ ids: data });
      return { success: true, saved: !saved, message };
    } catch (err) {
      set(previous);
      return { success: false, message: err.message };
    }
  },

  clear: () => set({ ids: [], books: [], hasLoaded: false }),
}));

export const useIsSaved = (bookId) => useWishlistStore((state) => state.ids.includes(bookId));
export const useWishlistCount = () => useWishlistStore((state) => state.ids.length);
