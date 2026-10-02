import { Badge } from "@chakra-ui/react";

export const LOW_STOCK = 5;

// "Out of stock", "Only 3 left" or "In stock".
// `overlay` gives an opaque badge that stays readable on top of a cover image.
const StockBadge = ({ stock = 0, overlay = false, ...props }) => {
	const [color, label] = stock <= 0 ? ["red", "Out of stock"] : stock <= LOW_STOCK ? ["orange", `Only ${stock} left`] : ["green", "In stock"];
	const overlayStyle = overlay ? { bg: `${color}.500`, color: "white" } : {};
	return (
		<Badge colorScheme={color} {...overlayStyle} {...props}>
			{label}
		</Badge>
	);
};
export default StockBadge;
