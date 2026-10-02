import { create } from "zustand";
import { request } from "../api/request";

// A blank book for the create form
export const EMPTY_BOOK = { title: "", author: "", publishYear: "", price: "", image: "", category: "", description: "", stock: "" };

const hasAllFields = (book) =>
  book.title && book.author && book.publishYear && book.price && book.image;

export const useBookStore = create((set) => ({
  books: [],

  // Set books
  setBooks: (books) => set({ books }),

  categories: [],
  isLoading: false,

  // Fetch books. Optional filters: { q, category, minPrice, maxPrice, sort }
  fetchBooks: async (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ""));
    const query = params.toString();
    set({ isLoading: true });
    try {
      const data = await request(query ? `/books?${query}` : "/books");
      set({ books: data.data || [], isLoading: false });
      return true;
    } catch (err) {
      console.error("Error fetching books:", err);
      set({ books: [], isLoading: false });
      return false;
    }
  },

  // Categories that have at least one book
  fetchCategories: async () => {
    try {
      const { data } = await request("/books/categories");
      set({ categories: data });
    } catch (err) {
      console.error("Error fetching categories:", err);
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
      return { success: true, message: data.message, book: data.data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
}));
