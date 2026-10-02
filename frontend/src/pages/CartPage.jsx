import {
	Box,
	Button,
	Container,
	Flex,
	Grid,
	HStack,
	IconButton,
	Link,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Skeleton,
	Stack,
	StackDivider,
	Text,
} from "@chakra-ui/react";
import { FiArrowLeft, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import BookCover from "../components/BookCover";
import EmptyState from "../components/EmptyState";
import OrderSummary from "../components/OrderSummary";
import PageHeader from "../components/PageHeader";
import { useCartLines } from "../hooks/useCartLines";
import { MAX_QUANTITY, useCartStore } from "../store/cart";
import { formatPrice } from "../utils/format";

const CartPage = () => {
	const { lines, total, isLoading } = useCartLines();
	const hasStockProblem = lines.some(({ quantity, book }) => quantity > (book.stock ?? 0));
	const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
	const { setQuantity, removeItem } = useCartStore();

	if (isLoading) {
		return (
			<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
				<Skeleton h='10' w='48' mb={8} />
				<Skeleton h='64' rounded='xl' />
			</Container>
		);
	}

	return (
		<Container maxW='container.xl' py={{ base: 6, md: 10 }}>
			<PageHeader title='Your Cart' subtitle={lines.length ? `${itemCount} ${itemCount === 1 ? "item" : "items"} ready for checkout` : undefined} />

			{lines.length === 0 ? (
				<EmptyState
					icon={FiShoppingCart}
					title='Your cart is empty.'
					description='Find something you love and add it to your cart.'
					action={
						<Button as={RouterLink} to='/'>
							Browse books
						</Button>
					}
				/>
			) : (
				<Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={8} alignItems='start'>
					<Box>
						<Stack layerStyle='card' divider={<StackDivider borderColor='border.subtle' />} spacing={0}>
							{lines.map(({ bookId, quantity, book }) => {
								const tooMany = quantity > (book.stock ?? 0);
								return (
									<Flex key={bookId} p={{ base: 4, md: 5 }} gap={{ base: 3, md: 5 }} align='center'>
										<Box as={RouterLink} to={`/book/${bookId}`} w={{ base: "16", md: "20" }} flexShrink={0}>
											<BookCover book={book} rounded='md' compact />
										</Box>
										<Box flex='1' minW={0}>
											<Link as={RouterLink} to={`/book/${bookId}`} color='text.default' fontWeight='semibold' noOfLines={2}>
												{book.title}
											</Link>
											<Text fontSize='sm' color='text.muted' noOfLines={1}>
												{book.author}
											</Text>
											<Text fontSize='sm' color='text.subtle' mt={1}>
												{formatPrice(book.price)} each
											</Text>
											{tooMany && (
												<Text fontSize='sm' color='red.500' mt={1}>
													{book.stock ? `Only ${book.stock} left. Please lower the quantity.` : "Out of stock. Please remove it."}
												</Text>
											)}
										</Box>
										<Flex direction={{ base: "column", sm: "row" }} align={{ base: "flex-end", sm: "center" }} gap={{ base: 2, sm: 5 }}>
											<NumberInput size='sm' maxW='20' min={1} max={Math.max(1, Math.min(book.stock ?? 0, MAX_QUANTITY))} value={quantity} onChange={(_, value) => !Number.isNaN(value) && setQuantity(bookId, value)}>
												<NumberInputField aria-label={`Quantity of ${book.title}`} rounded='md' />
												<NumberInputStepper>
													<NumberIncrementStepper />
													<NumberDecrementStepper />
												</NumberInputStepper>
											</NumberInput>
											<Text fontWeight='bold' w={{ sm: "24" }} textAlign='right'>
												{formatPrice(book.price * quantity)}
											</Text>
										</Flex>
										<IconButton aria-label={`Remove ${book.title}`} icon={<FiTrash2 />} variant='ghost' colorScheme='gray' size='sm' onClick={() => removeItem(bookId)} />
									</Flex>
								);
							})}
						</Stack>
						<Button as={RouterLink} to='/' variant='ghost' leftIcon={<FiArrowLeft />} mt={4}>
							Continue shopping
						</Button>
					</Box>

					<OrderSummary itemCount={itemCount} total={total}>
						<Button as={RouterLink} to='/checkout' size='lg' w='full' isDisabled={hasStockProblem} onClick={(e) => hasStockProblem && e.preventDefault()}>
							Checkout
						</Button>
						{hasStockProblem && (
							<Text fontSize='sm' color='red.500' mt={3}>
								Fix the highlighted items to continue.
							</Text>
						)}
						<HStack justify='center' mt={4} fontSize='xs' color='text.subtle'>
							<Text>Secure checkout · Cash on delivery</Text>
						</HStack>
					</OrderSummary>
				</Grid>
			)}
		</Container>
	);
};
export default CartPage;
