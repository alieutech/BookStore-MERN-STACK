import { describe, expect, it } from "vitest";
import { pageItems, resultSummary } from "../utils/pagination";

describe("pageItems", () => {
	it("lists every page when there are few", () => {
		expect(pageItems(2, 4)).toEqual([1, 2, 3, 4]);
	});

	it("shows the first, last and neighbours with gaps", () => {
		expect(pageItems(5, 12)).toEqual([1, "…", 4, 5, 6, "…", 12]);
		expect(pageItems(1, 12)).toEqual([1, 2, "…", 12]);
		expect(pageItems(12, 12)).toEqual([1, "…", 11, 12]);
	});
});

describe("resultSummary", () => {
	it("shows the range on multi-page results", () => {
		expect(resultSummary({ page: 2, limit: 24, total: 60, totalPages: 3 }, 24)).toBe("Showing 25–48 of 60 books");
		expect(resultSummary({ page: 3, limit: 24, total: 60, totalPages: 3 }, 12)).toBe("Showing 49–60 of 60 books");
	});

	it("shows a plain count on a single page", () => {
		expect(resultSummary({ page: 1, limit: 24, total: 1, totalPages: 1 }, 1)).toBe("1 book");
		expect(resultSummary(null, 3)).toBe("3 books");
	});
});
