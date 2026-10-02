import { Badge } from "@chakra-ui/react";

export const LOW_STOCK = 5;

// "Out of stock", "Only 3 left" or "In stock"
const StockBadge = ({ stock = 0 }) => {
	if (stock <= 0) return <Badge colorScheme='red'>Out of stock</Badge>;
	if (stock <= LOW_STOCK) return <Badge colorScheme='orange'>Only {stock} left</Badge>;
	return <Badge colorScheme='green'>In stock</Badge>;
};
export default StockBadge;
