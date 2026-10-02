import { useToast } from "@chakra-ui/react";
import { useCartStore } from "../store/cart";

// Add a book to the cart (respecting its stock) and show a toast
export const useAddToCart = () => {
	const addItem = useCartStore((state) => state.addItem);
	const toast = useToast();

	return (book) => {
		const added = addItem(book._id, book.stock ?? 0);
		toast({
			title: added ? "Added to cart" : "Can't add more",
			description: added ? `"${book.title}" is in your cart.` : `Only ${book.stock} ${book.stock === 1 ? "copy" : "copies"} of "${book.title}" available.`,
			status: added ? "success" : "warning",
			duration: 2000,
			isClosable: true,
		});
	};
};
