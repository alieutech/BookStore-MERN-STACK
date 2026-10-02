import { Box, Button, Container, Flex, FormControl, FormLabel, Grid, Heading, HStack, Input, Radio, SimpleGrid, Skeleton, Text, useToast, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { FiDollarSign, FiLock } from "react-icons/fi";
import { Navigate, useNavigate } from "react-router-dom";
import BookCover from "../components/BookCover";
import CheckoutSteps from "../components/CheckoutSteps";
import OrderSummary from "../components/OrderSummary";
import PageHeader from "../components/PageHeader";
import { useCartLines } from "../hooks/useCartLines";
import { useAuthStore } from "../store/auth";
import { useCartStore } from "../store/cart";
import { useOrderStore } from "../store/orders";
import { formatPrice } from "../utils/format";

const ADDRESS_FIELDS = [
	{ name: "fullName", label: "Full name", autoComplete: "name", span: 2 },
	{ name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", span: 2 },
	{ name: "address", label: "Street address", autoComplete: "street-address", span: 2 },
	{ name: "city", label: "City", autoComplete: "address-level2" },
	{ name: "country", label: "Country", autoComplete: "country-name" },
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
	const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

	if (isLoading) {
		return (
			<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
				<Skeleton h='10' w='48' mb={8} />
				<Skeleton h='96' rounded='xl' />
			</Container>
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
			toast({ title: "Could not place order", description: message, status: "error", duration: 5000 });
			return;
		}
		clearCart();
		toast({ title: "Thank you!", description: message, status: "success", duration: 4000 });
		navigate("/my-orders", { replace: true });
	};

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			<PageHeader title='Checkout' breadcrumbs={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
			<CheckoutSteps active={1} />

			<Grid as='form' onSubmit={handleSubmit} templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={8} alignItems='start'>
				<VStack align='stretch' spacing={6}>
					<Box layerStyle='card' p={{ base: 5, md: 8 }}>
						<Heading as='h2' size='md' mb={1}>
							Shipping address
						</Heading>
						<Text color='text.muted' fontSize='sm' mb={6}>
							Where should we deliver your books?
						</Text>
						<SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
							{ADDRESS_FIELDS.map((field) => (
								<FormControl key={field.name} isRequired gridColumn={{ md: field.span === 2 ? "span 2" : undefined }}>
									<FormLabel>{field.label}</FormLabel>
									<Input name={field.name} type={field.type || "text"} autoComplete={field.autoComplete} value={address[field.name]} onChange={(e) => setAddress({ ...address, [field.name]: e.target.value })} />
								</FormControl>
							))}
						</SimpleGrid>
					</Box>

					<Box layerStyle='card' p={{ base: 5, md: 8 }}>
						<Heading as='h2' size='md' mb={4}>
							Payment
						</Heading>
						<HStack borderWidth='2px' borderColor='brand.400' bg='bg.brand' rounded='lg' p={4} spacing={4}>
							<Radio isChecked readOnly colorScheme='brand' aria-label='Cash on delivery' />
							<Box flex='1'>
								<Text fontWeight='semibold'>Cash on delivery</Text>
								<Text fontSize='sm' color='text.muted'>
									Pay in cash when your books arrive. No card needed.
								</Text>
							</Box>
							<Box color='text.brand' fontSize='2xl'>
								<FiDollarSign />
							</Box>
						</HStack>
					</Box>
				</VStack>

				<OrderSummary itemCount={itemCount} total={total}>
					<VStack align='stretch' spacing={3} mb={6} maxH='64' overflowY='auto'>
						{lines.map(({ bookId, quantity, book }) => (
							<Flex key={bookId} gap={3} align='center' fontSize='sm'>
								<Box w='10' flexShrink={0}>
									<BookCover book={book} rounded='sm' compact />
								</Box>
								<Text flex='1' noOfLines={2}>
									{book.title} × {quantity}
								</Text>
								<Text fontWeight='medium'>{formatPrice(book.price * quantity)}</Text>
							</Flex>
						))}
					</VStack>
					<Button type='submit' size='lg' w='full' isLoading={isSubmitting} leftIcon={<FiLock />}>
						Place order
					</Button>
				</OrderSummary>
			</Grid>
		</Container>
	);
};
export default CheckoutPage;
