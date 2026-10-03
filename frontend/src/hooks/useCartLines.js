import { useEffect, useMemo, useRef, useState } from "react";
import { request } from "../api/request";
import { useCartStore } from "../store/cart";

const IDS_PER_REQUEST = 100; // the API's limit for ?ids=

// Fetch the latest data for exactly these books (in batches), or null if a request fails
const fetchBooksByIds = async (ids) => {
	const books = [];
	for (let i = 0; i < ids.length; i += IDS_PER_REQUEST) {
		const batch = ids.slice(i, i + IDS_PER_REQUEST);
		const { data } = await request(`/books?ids=${batch.join(",")}&limit=${IDS_PER_REQUEST}`);
		books.push(...data);
	}
	return books;
};

// Loads the latest data for the books in the cart and joins them with the cart.
// Returns cart lines with current titles/prices, the total, whether books are still loading,
// and an error (with retry) if they couldn't be loaded — so a network hiccup never looks like an empty cart.
export const useCartLines = () => {
	const { items, keepOnly } = useCartStore();
	const [books, setBooks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [attempt, setAttempt] = useState(0);
	const loadedAttempt = useRef(-1);
	// Refetch only when the set of books changes, not when a quantity changes
	const idsKey = items.map((item) => item.bookId).sort().join(",");

	useEffect(() => {
		let cancelled = false;
		const ids = idsKey ? idsKey.split(",") : [];
		// Nothing new to load (e.g. an item was just removed): keep what we have
		const loaded = new Set(books.map((book) => book._id));
		if (ids.every((id) => loaded.has(id)) && attempt === loadedAttempt.current) {
			setIsLoading(false);
			return;
		}
		loadedAttempt.current = attempt;
		setIsLoading(true);
		setError(null);
		fetchBooksByIds(ids)
			.then((found) => {
				if (cancelled) return;
				setBooks(found);
				// Only prune the cart when we really know which books still exist
				keepOnly(found.map((book) => book._id));
			})
			.catch((err) => !cancelled && setError(err))
			.finally(() => !cancelled && setIsLoading(false));
		return () => {
			cancelled = true;
		};
	}, [idsKey, keepOnly, attempt]); // eslint-disable-line react-hooks/exhaustive-deps -- `books` is only read to skip refetches

	return useMemo(() => {
		const lines = items
			.map((item) => ({ ...item, book: books.find((book) => book._id === item.bookId) }))
			.filter((line) => line.book);
		const total = lines.reduce((sum, line) => sum + line.book.price * line.quantity, 0);
		return { lines, total, isLoading, error, retry: () => setAttempt((n) => n + 1) };
	}, [items, books, isLoading, error]);
};
