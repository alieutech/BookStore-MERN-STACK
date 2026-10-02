import { beforeEach, describe, expect, it } from "vitest";
import { MAX_QUANTITY, useCartStore } from "../store/cart";

const cart = () => useCartStore.getState();

describe("cart store", () => {
	beforeEach(() => cart().clear());

	it("adds a book and increases the quantity on repeat adds", () => {
		expect(cart().addItem("a", 5)).toBe(true);
		expect(cart().addItem("a", 5)).toBe(true);
		expect(cart().items).toEqual([{ bookId: "a", quantity: 2 }]);
	});

	it("never goes above the stock", () => {
		cart().addItem("a", 2);
		cart().addItem("a", 2);
		expect(cart().addItem("a", 2)).toBe(false);
		expect(cart().items[0].quantity).toBe(2);
	});

	it("refuses books that are out of stock", () => {
		expect(cart().addItem("a", 0)).toBe(false);
		expect(cart().items).toEqual([]);
	});

	it("keeps quantities between 1 and the maximum", () => {
		cart().addItem("a", 10);
		cart().setQuantity("a", 0);
		expect(cart().items[0].quantity).toBe(1);
		cart().setQuantity("a", 1000);
		expect(cart().items[0].quantity).toBe(MAX_QUANTITY);
	});

	it("removes items and drops books that no longer exist", () => {
		cart().addItem("a", 5);
		cart().addItem("b", 5);
		cart().addItem("c", 5);
		cart().removeItem("a");
		cart().keepOnly(["c"]);
		expect(cart().items.map((item) => item.bookId)).toEqual(["c"]);
	});
});
