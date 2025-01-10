import { create } from "zustand";

// API Base URL 
const API_BASE_URL = "http://localhost:3333";

export const useBookStore = create((set) => ({
  books: [],

  // Set books
  setBooks: (books) => set({ books }),

  // Fetch all books
  fetchBooks: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/books`);
      if (!res.ok) {
        throw new Error(`Failed to fetch books: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched books:", data);
      set({ books: data.data || [] }); 
    } catch (err) {
      console.error("Error fetching books:", err);
      set({ books: [] }); 
    }
  },

  // Create a new book
  createBook: async (newBook) => {
    if (!newBook.title || !newBook.author || !newBook.publishYear || !newBook.image || !newBook.price) {
      return { success: false, message: "Please fill in all fields." };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBook),
      });

      if (!res.ok) {
        throw new Error(`Failed to create book: ${res.status}`);
      }

      const data = await res.json();
      set((state) => ({ books: [...state.books, data.data] }));
      console.log("Book created successfully:", data);
      return { success: true, message: "Book created successfully" };
    } catch (err) {
      console.error("Error creating book:", err);
      return { success: false, message: "Failed to add book." };
    }
  },

  // Delete a book
  deleteBook: async (pid) => {
      const res = await fetch(`${API_BASE_URL}/books/${pid}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete book: ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      // Update the books state
      set((state) => ({ books: state.books.filter((book) => book._id !== pid) }));
      console.log("Book deleted successfully:", pid);
      return { success: true, message: "Book deleted successfully." };
    
  },

  // Update a book
  updateBook: async (pid, updatedBook) => {
    try {
      const res = await fetch(`${API_BASE_URL}/books/${pid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
        
      });

      

      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };

      // Update the books state
      set((state) => ({
        books: state.books.map((book) => (book._id === pid ? data.data : book)),
      }));
      console.log("Book updated successfully:", data);
      return { success: true, message: "Book updated successfully."};  
  
 } catch (err) {
  console.error("Error updating book:", err);
  return { success: false, message: "Failed to update book." };
}
}
}));
