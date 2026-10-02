import { describe, expect, it } from "vitest";
import { formatPrice } from "../utils/format";

describe("formatPrice", () => {
	it("shows dalasi with two decimals", () => {
		expect(formatPrice(12.5)).toBe("D12.50");
		expect(formatPrice(20)).toBe("D20.00");
	});

	it("treats missing values as zero", () => {
		expect(formatPrice(undefined)).toBe("D0.00");
	});
});
