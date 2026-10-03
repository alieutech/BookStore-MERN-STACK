// Page numbers to show: always the first and last, plus a window around the current page,
// with "…" for the gaps. e.g. pageItems(5, 12) → [1, "…", 4, 5, 6, "…", 12]
export const pageItems = (page, totalPages, siblings = 1) => {
	const items = [];
	for (let p = 1; p <= totalPages; p++) {
		if (p === 1 || p === totalPages || Math.abs(p - page) <= siblings) items.push(p);
		else if (items.at(-1) !== "…") items.push("…");
	}
	return items;
};

// "Showing 25–48 of 120 books", or "8 books" when everything fits on one page
export const resultSummary = (pagination, count) => {
	if (!pagination) return `${count} ${count === 1 ? "book" : "books"}`;
	const { page, limit, total, totalPages } = pagination;
	if (totalPages <= 1 || total === 0) return `${total} ${total === 1 ? "book" : "books"}`;
	const first = (page - 1) * limit + 1;
	return `Showing ${first}–${first + count - 1} of ${total} books`;
};
