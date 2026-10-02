import { create } from "zustand";

// API base URL. Empty by default so requests go through the Vite dev proxy
// (see vite.config.ts); set VITE_API_URL to call the API directly.
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Send a request and return the parsed JSON body, or throw with the server's message
const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

const hasAllFields = (book) =>
  book.title && book.author && book.publishYear && book.price && book.image;

export const useBookStore = create((set) => ({
  books: [],

  // Set books
  setBooks: (books) => set({ books }),

  // Fetch all books
  fetchBooks: async () => {
    try {
      const data = await request("/books");
      set({ books: data.data || [] });
    } catch (err) {
      console.error("Error fetching books:", err);
      set({ books: [] });
    }
  },

  // Create a new book
  createBook: async (newBook) => {
    if (!hasAllFields(newBook)) {
      return { success: false, message: "Please fill in all fields." };
    }
    try {
      const data = await request("/books", { method: "POST", body: JSON.stringify(newBook) });
      set((state) => ({ books: [...state.books, data.data] }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Delete a book
  deleteBook: async (id) => {
    try {
      const data = await request(`/books/${id}`, { method: "DELETE" });
      set((state) => ({ books: state.books.filter((book) => book._id !== id) }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // Update a book
  updateBook: async (id, updatedBook) => {
    if (!hasAllFields(updatedBook)) {
      return { success: false, message: "Please fill in all fields." };
    }
    try {
      const data = await request(`/books/${id}`, { method: "PUT", body: JSON.stringify(updatedBook) });
      set((state) => ({
        books: state.books.map((book) => (book._id === id ? data.data : book)),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
}));
