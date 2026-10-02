import { useEffect, useMemo, useState } from "react";
import { useBookStore } from "../store/book";
import { useCartStore } from "../store/cart";

// Loads the latest books and joins them with the cart.
// Returns cart lines with current titles/prices, the total, and whether books are still loading.
export const useCartLines = () => {
	const { books, fetchBooks } = useBookStore();
	const { items, keepOnly } = useCartStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchBooks().then((ok) => {
			// Only prune the cart when we really know which books exist
			if (ok) keepOnly(useBookStore.getState().books.map((book) => book._id));
			setIsLoading(false);
		});
	}, [fetchBooks, keepOnly]);

	return useMemo(() => {
		const lines = items
			.map((item) => ({ ...item, book: books.find((book) => book._id === item.bookId) }))
			.filter((line) => line.book);
		const total = lines.reduce((sum, line) => sum + line.book.price * line.quantity, 0);
		return { lines, total, isLoading };
	}, [items, books, isLoading]);
};
