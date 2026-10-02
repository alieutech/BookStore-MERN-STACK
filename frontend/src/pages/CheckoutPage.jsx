import { Box, Button, Container, Divider, Flex, Heading, Input, Spinner, Text, useColorModeValue, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCartLines } from "../hooks/useCartLines";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart";
import { useOrderStore } from "../store/orders";
import { formatPrice } from "../utils/format";

const ADDRESS_FIELDS = [
	{ name: "fullName", placeholder: "Full name", autoComplete: "name" },
	{ name: "phone", placeholder: "Phone number", type: "tel", autoComplete: "tel" },
	{ name: "address", placeholder: "Street address", autoComplete: "street-address" },
	{ name: "city", placeholder: "City", autoComplete: "address-level2" },
	{ name: "country", placeholder: "Country", autoComplete: "country-name" },
];

const CheckoutPage = () => {
	const user = useAuthStore((state) => state.user);
	const { lines, total, isLoading } = useCartLines();
	const clearCart = useCartStore((state) => state.clear);
	const placeOrder = useOrderStore((state) => state.placeOrder);
	const [address, setAddress] = useState({ fullName: user?.name || "", phone: "", address: "", city: "", country: "" });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const toast = useToast();
	const navigate = useNavigate();
	const bg = useColorModeValue("white", "gray.800");

	if (isLoading) {
		return (
			<Flex justify='center' py={20}>
				<Spinner size='xl' />
			</Flex>
		);
	}
	// Nothing to check out (but stay put while the order we just placed redirects)
	if (lines.length === 0 && !isSubmitting) return <Navigate to='/cart' replace />;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		const { success, message } = await placeOrder(lines, address);
		if (!success) {
			setIsSubmitting(false);
			toast({ title: "Could not place order", description: message, status: "error", duration: 5000, isClosable: true });
			return;
		}
		clearCart();
		toast({ title: "Thank you!", description: message, status: "success", duration: 4000, isClosable: true });
		navigate("/my-orders", { replace: true });
	};

	return (
		<Container maxW='container.sm' py={12}>
			<Heading as='h1' size='xl' mb={8} textAlign='center'>
				Checkout
			</Heading>
			<Box as='form' onSubmit={handleSubmit} bg={bg} p={6} rounded='lg' shadow='md'>
				<VStack spacing={4} align='stretch'>
					<Heading as='h2' size='md'>
						Shipping address
					</Heading>
					{ADDRESS_FIELDS.map((field) => (
						<Input
							key={field.name}
							name={field.name}
							type={field.type || "text"}
							placeholder={field.placeholder}
							autoComplete={field.autoComplete}
							value={address[field.name]}
							onChange={(e) => setAddress({ ...address, [field.name]: e.target.value })}
							isRequired
						/>
					))}

					<Divider />

					<Heading as='h2' size='md'>
						Order summary
					</Heading>
					{lines.map(({ bookId, quantity, book }) => (
						<Flex key={bookId} justify='space-between'>
							<Text>
								{book.title} × {quantity}
							</Text>
							<Text>{formatPrice(book.price * quantity)}</Text>
						</Flex>
					))}
					<Flex justify='space-between' fontWeight='bold' fontSize='lg'>
						<Text>Total</Text>
						<Text>{formatPrice(total)}</Text>
					</Flex>
					<Text fontSize='sm' color='gray.500'>
						Payment: cash on delivery. You pay when your books arrive.
					</Text>

					<Button type='submit' colorScheme='blue' size='lg' isLoading={isSubmitting}>
						Place order
					</Button>
				</VStack>
			</Box>
		</Container>
	);
};
export default CheckoutPage;
