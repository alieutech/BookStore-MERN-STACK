import { create } from "zustand";
import { request } from "../api/request";

export const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,

  // Place an order from cart items ({ bookId, quantity }) and a shipping address
  placeOrder: async (cartItems, shippingAddress) => {
    try {
      const { data, message } = await request("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map((item) => ({ book: item.bookId, quantity: item.quantity })),
          shippingAddress,
        }),
      });
      return { success: true, message, order: data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // The logged-in user's orders, or every order when `all` is true (admins only)
  fetchOrders: async ({ all = false } = {}) => {
    set({ isLoading: true });
    try {
      const { data } = await request(all ? "/orders" : "/orders/mine");
      set({ orders: data, isLoading: false });
    } catch (err) {
      console.error("Error fetching orders:", err);
      set({ orders: [], isLoading: false });
    }
  },

  cancelOrder: async (id) => {
    try {
      const { data, message } = await request(`/orders/${id}/cancel`, { method: "PUT" });
      set((state) => ({ orders: state.orders.map((order) => (order._id === id ? data : order)) }));
      return { success: true, message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { data, message } = await request(`/orders/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      set((state) => ({ orders: state.orders.map((order) => (order._id === id ? data : order)) }));
      return { success: true, message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
}));
