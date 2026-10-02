import {
	Box,
	Button,
	Container,
	Flex,
	Heading,
	HStack,
	IconButton,
	Image,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Spinner,
	Text,
	useColorModeValue,
	VStack,
} from "@chakra-ui/react";
import { MdDelete } from "react-icons/md";
import { Link as RouterLink } from "react-router-dom";
import { useCartLines } from "../hooks/useCartLines";
import { MAX_QUANTITY, useCartStore } from "../store/cart";
import { formatPrice } from "../utils/format";

const CartPage = () => {
	const { lines, total, isLoading } = useCartLines();
	const hasStockProblem = lines.some(({ quantity, book }) => quantity > (book.stock ?? 0));
	const { setQuantity, removeItem } = useCartStore();
	const bg = useColorModeValue("white", "gray.800");

	if (isLoading) {
		return (
			<Flex justify='center' py={20}>
				<Spinner size='xl' />
			</Flex>
		);
	}

	return (
		<Container maxW='container.md' py={12}>
			<Heading as='h1' size='xl' mb={8} textAlign='center'>
				Your Cart
			</Heading>

			{lines.length === 0 ? (
				<VStack spacing={4}>
					<Text fontSize='xl' color='gray.500'>
						Your cart is empty.
					</Text>
					<Button as={RouterLink} to='/' colorScheme='blue'>
						Browse books
					</Button>
				</VStack>
			) : (
				<VStack spacing={4} align='stretch'>
					{lines.map(({ bookId, quantity, book }) => (
						<HStack key={bookId} bg={bg} p={4} rounded='lg' shadow='md' spacing={4}>
							<Image src={book.image} alt={book.title} boxSize='16' objectFit='cover' rounded='md' />
							<Box flex='1'>
								<Text fontWeight='bold'>{book.title}</Text>
								<Text fontSize='sm' color='gray.500'>
									{book.author} · {formatPrice(book.price)} each
								</Text>
								{quantity > (book.stock ?? 0) && (
									<Text fontSize='sm' color='red.500'>
										{book.stock ? `Only ${book.stock} left. Please lower the quantity.` : "Out of stock. Please remove it."}
									</Text>
								)}
							</Box>
							<NumberInput
								size='sm'
								maxW='20'
								min={1}
								max={Math.max(1, Math.min(book.stock ?? 0, MAX_QUANTITY))}
								value={quantity}
								onChange={(_, value) => !Number.isNaN(value) && setQuantity(bookId, value)}
							>
								<NumberInputField aria-label={`Quantity of ${book.title}`} />
								<NumberInputStepper>
									<NumberIncrementStepper />
									<NumberDecrementStepper />
								</NumberInputStepper>
							</NumberInput>
							<Text fontWeight='semibold' w='24' textAlign='right'>
								{formatPrice(book.price * quantity)}
							</Text>
							<IconButton aria-label={`Remove ${book.title}`} icon={<MdDelete />} variant='ghost' colorScheme='red' onClick={() => removeItem(bookId)} />
						</HStack>
					))}

					<Flex justify='space-between' align='center' pt={4}>
						<Text fontSize='2xl' fontWeight='bold'>
							Total: {formatPrice(total)}
						</Text>
						<Button as={RouterLink} to='/checkout' colorScheme='blue' size='lg' isDisabled={hasStockProblem} onClick={(e) => hasStockProblem && e.preventDefault()}>
							Checkout
						</Button>
					</Flex>
				</VStack>
			)}
		</Container>
	);
};
export default CartPage;
